import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import os
import argparse
import requests
import zipfile
import io
from facenet_pytorch import MTCNN
from urllib.parse import urlparse
from pathlib import Path

# MesoNet implementation (based on original paper)
class MesoNet(nn.Module):
    """
    Implementation of MesoNet as described in the paper:
    MesoNet: a Compact Facial Video Forgery Detection Network
    """
    def __init__(self):
        super(MesoNet, self).__init__()
        
        # First layer
        self.conv1 = nn.Conv2d(3, 8, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(8)
        self.relu = nn.ReLU(inplace=True)
        self.leakyrelu = nn.LeakyReLU(0.1)
        self.pooling = nn.MaxPool2d(2, 2)
        
        # First block
        self.conv2 = nn.Conv2d(8, 8, 5, padding=2, bias=False)
        self.bn2 = nn.BatchNorm2d(8)
        self.conv3 = nn.Conv2d(8, 16, 5, padding=2, bias=False)
        self.bn3 = nn.BatchNorm2d(16)
        self.conv4 = nn.Conv2d(16, 16, 5, padding=2, bias=False)
        self.bn4 = nn.BatchNorm2d(16)
        
        # Second block
        self.conv5 = nn.Conv2d(16, 16, 5, padding=2, bias=False)
        self.bn5 = nn.BatchNorm2d(16)
        self.conv6 = nn.Conv2d(16, 32, 5, padding=2, bias=False)
        self.bn6 = nn.BatchNorm2d(32)
        self.conv7 = nn.Conv2d(32, 32, 5, padding=2, bias=False)
        self.bn7 = nn.BatchNorm2d(32)
        
        # Final classification layers
        self.fc1 = nn.Linear(32 * 8 * 8, 16)
        self.fc2 = nn.Linear(16, 2)
        
    def forward(self, x):
        # First layer
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.pooling(x)
        
        # First block
        x = self.conv2(x)
        x = self.bn2(x)
        x = self.relu(x)
        x = self.conv3(x)
        x = self.bn3(x)
        x = self.relu(x)
        x = self.conv4(x)
        x = self.bn4(x)
        x = self.relu(x)
        x = self.pooling(x)
        
        # Second block
        x = self.conv5(x)
        x = self.bn5(x)
        x = self.relu(x)
        x = self.conv6(x)
        x = self.bn6(x)
        x = self.relu(x)
        x = self.conv7(x)
        x = self.bn7(x)
        x = self.relu(x)
        x = self.pooling(x)
        
        # Classification
        x = x.view(x.size(0), -1)
        x = self.fc1(x)
        x = self.leakyrelu(x)
        x = self.fc2(x)
        
        return x

class DeepfakeDetector:
    def __init__(self, model_type='xception', model_path=None):
        # Initialize face detector
        self.face_detector = MTCNN(keep_all=True, device='cuda' if torch.cuda.is_available() else 'cpu')
        
        # Choose from available pre-trained models
        self.model_type = model_type
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        if model_type == 'xception':
            # Xception model from FaceForensics++ (best performing in their benchmark)
            self.model = models.xception(pretrained=False)
            num_ftrs = self.model.fc.in_features
            self.model.fc = nn.Linear(num_ftrs, 2)
            
            # Default path for pre-trained FF++ Xception model
            default_path = "pretrained_models/xception_ff++.pth"
            model_path = model_path or default_path
            
        elif model_type == 'mesonet':
            # MesoNet - a compact model specifically for deepfake detection
            self.model = MesoNet()
            
            # Default path for pre-trained MesoNet model
            default_path = "pretrained_models/mesonet.pth"
            model_path = model_path or default_path
            
        elif model_type == 'efficientnet':
            # EfficientNet with FF++ weights
            self.model = models.efficientnet_b3(pretrained=True)
            num_ftrs = self.model.classifier[1].in_features
            self.model.classifier[1] = nn.Linear(num_ftrs, 2)
            
            # Default path for EfficientNet model
            default_path = "pretrained_models/efficientnet_dfdc.pth"
            model_path = model_path or default_path
            
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        # Load pre-trained weights if available
        if model_path and os.path.exists(model_path):
            print(f"Loading pre-trained model from {model_path}")
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        else:
            print(f"Warning: Pre-trained model {model_path} not found. Using random weights.")
            print("Download instructions: Check https://github.com/ondyari/FaceForensics for FF++ models")
            print("or https://github.com/DariusAf/MesoNet for MesoNet weights")
        
        self.model.eval()
        self.model = self.model.to(self.device)
        
        # Define preprocessing transform
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        # Temporal inconsistency detection parameters
        self.eye_blink_threshold = 0.2
        self.mouth_movement_threshold = 0.3
        self.facial_landmark_history = []
        self.temporal_window_size = 10
    
    def extract_faces(self, frame):
        """Extract faces from a frame using MTCNN."""
        img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        boxes, _ = self.face_detector.detect(img)
        faces = []
        
        if boxes is not None:
            for box in boxes:
                box = [int(b) for b in box]
                x1, y1, x2, y2 = box
                face = frame[y1:y2, x1:x2]
                if face.size > 0:  # Check if face extraction was successful
                    faces.append({
                        'face': face,
                        'bbox': (x1, y1, x2, y2)
                    })
        
        return faces
    
    def analyze_face(self, face_img):
        """Perform deepfake detection on a single face."""
        # Convert to PIL Image for transformation
        face_pil = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
        face_tensor = self.transform(face_pil).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(face_tensor)
            probs = F.softmax(outputs, dim=1)
            fake_prob = probs[0][1].item()
        
        return fake_prob
    
    def check_temporal_consistency(self, faces):
        """Check for temporal inconsistencies in facial movements."""
        if not faces:
            return 0.0
        
        # Simple implementation: check for unnatural rapid changes in face positions
        anomaly_score = 0.0
        
        if len(self.facial_landmark_history) >= self.temporal_window_size:
            # Compare current faces with history
            for face in faces:
                bbox = face['bbox']
                center_x = (bbox[0] + bbox[2]) / 2
                center_y = (bbox[1] + bbox[3]) / 2
                
                # Check for unnatural jumps in position
                prev_centers = [(h[0], h[1]) for h in self.facial_landmark_history[-5:]]
                diffs = [np.sqrt((center_x - px)**2 + (center_y - py)**2) for px, py in prev_centers]
                
                if diffs and max(diffs) > 50:  # Threshold for unnatural movement
                    anomaly_score += 0.3
            
            # Update history with new face positions
            self.facial_landmark_history.append([(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2 
                                               for face in faces for bbox in [face['bbox']]])
            
            # Keep history within window size
            while len(self.facial_landmark_history) > self.temporal_window_size:
                self.facial_landmark_history.pop(0)
        else:
            # Build up history
            self.facial_landmark_history.append([(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2 
                                               for face in faces for bbox in [face['bbox']]])
        
        return min(anomaly_score, 1.0)
    
    def analyze_video(self, video_path, output_path=None, sample_rate=30):
        """
        Analyze a video for deepfakes.
        
        Args:
            video_path: Path to the video file
            output_path: Optional path to save annotated video
            sample_rate: Process every Nth frame
        
        Returns:
            Dictionary with analysis results
        """
        cap = cv2.VideoCapture(video_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Setup output video if needed
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        results = {
            'overall_score': 0.0,
            'frames_analyzed': 0,
            'faces_detected': 0,
            'temporal_inconsistencies': 0.0,
            'per_face_results': []
        }
        
        total_fake_prob = 0.0
        total_temporal_score = 0.0
        frame_idx = 0
        analyzed_frames = 0
        
        self.facial_landmark_history = []  # Reset history
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Only process every Nth frame to save time
            if frame_idx % sample_rate == 0:
                analyzed_frames += 1
                
                # Extract faces
                faces = self.extract_faces(frame)
                results['faces_detected'] += len(faces)
                
                # Check temporal consistency
                temporal_score = self.check_temporal_consistency(faces)
                total_temporal_score += temporal_score
                
                # Process each face
                for face_data in faces:
                    face_img = face_data['face']
                    bbox = face_data['bbox']
                    
                    # Get fake probability
                    fake_prob = self.analyze_face(face_img)
                    total_fake_prob += fake_prob
                    
                    # Store individual face result
                    results['per_face_results'].append({
                        'frame': frame_idx,
                        'bbox': bbox,
                        'fake_probability': fake_prob
                    })
                    
                    # Annotate frame if output requested
                    if output_path:
                        x1, y1, x2, y2 = bbox
                        color = (0, 0, 255) if fake_prob > 0.5 else (0, 255, 0)
                        thickness = 2
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
                        cv2.putText(frame, f"Fake: {fake_prob:.2f}", (x1, y1-10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, thickness)
                
                # Add temporal inconsistency note if significant
                if temporal_score > 0.2 and output_path:
                    cv2.putText(frame, f"Temporal anomaly: {temporal_score:.2f}", 
                                (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    
                # Write the frame if output requested
                if output_path:
                    out.write(frame)
            
            frame_idx += 1
            
            # Display progress
            if frame_idx % 100 == 0:
                print(f"Processed {frame_idx}/{frame_count} frames...")
        
        # Calculate overall results
        if results['faces_detected'] > 0:
            avg_fake_prob = total_fake_prob / results['faces_detected']
        else:
            avg_fake_prob = 0.0
            
        if analyzed_frames > 0:
            avg_temporal_score = total_temporal_score / analyzed_frames
        else:
            avg_temporal_score = 0.0
            
        # Weight the overall score (60% face analysis, 40% temporal analysis)
        results['overall_score'] = 0.6 * avg_fake_prob + 0.4 * avg_temporal_score
        results['frames_analyzed'] = analyzed_frames
        results['temporal_inconsistencies'] = avg_temporal_score
        
        # Add a clear verdict
        if results['overall_score'] > 0.7:
            results['verdict'] = "Highly likely to be a deepfake"
        elif results['overall_score'] > 0.5:
            results['verdict'] = "Possibly a deepfake"
        else:
            results['verdict'] = "Likely authentic"
            
        # Release resources
        cap.release()
        if output_path:
            out.release()
            
        return results

def train_detector(train_dir, val_dir, epochs=10, batch_size=16, save_path="deepfake_detector.pth"):
    """
    Train the deepfake detector model.
    
    Args:
        train_dir: Directory with 'real' and 'fake' subdirectories of training images
        val_dir: Directory with 'real' and 'fake' subdirectories of validation images
        epochs: Number of training epochs
        batch_size: Batch size for training
        save_path: Path to save the trained model
    """
    # This function would implement training logic 
    # (Not fully implemented here for brevity)
    print("Training functionality would be implemented here.")
    print("For a production system, you'd need a large dataset of real and fake videos.")

def download_model(url, save_dir="pretrained_models"):
    """
    Download a pre-trained model from a URL and save it
    """
    # Create the directory if it doesn't exist
    os.makedirs(save_dir, exist_ok=True)
    
    # Get the filename from the URL
    parsed_url = urlparse(url)
    filename = os.path.basename(parsed_url.path)
    save_path = os.path.join(save_dir, filename)
    
    # Download the file if it doesn't exist
    if not os.path.exists(save_path):
        print(f"Downloading {filename} from {url}...")
        response = requests.get(url)
        
        if response.status_code == 200:
            # Check if it's a zip file
            if filename.endswith('.zip'):
                # Extract the zip file
                with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                    z.extractall(save_dir)
                print(f"Extracted {filename} to {save_dir}")
            else:
                # Save the file
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded {filename} to {save_path}")
        else:
            print(f"Failed to download {url}, status code: {response.status_code}")
            return None
    else:
        print(f"Model already exists at {save_path}")
    
    return save_path

def download_available_models():
    """
    Download available pre-trained models for deepfake detection
    """
    models_dir = "pretrained_models"
    os.makedirs(models_dir, exist_ok=True)
    
    models = {
        "MesoNet": "https://github.com/DariusAf/MesoNet/raw/master/weights/Meso4_DF.h5",
        "XceptionNet": "https://github.com/ondyari/FaceForensics/raw/master/classification/weights/xception/c23.p",
        # Add more models as they become available publicly
    }
    
    for model_name, url in models.items():
        try:
            path = download_model(url, models_dir)
            if path:
                print(f"Successfully downloaded {model_name} model")
        except Exception as e:
            print(f"Error downloading {model_name}: {str(e)}")
    
    print(f"Models are saved in {os.path.abspath(models_dir)}")

def main():
    parser = argparse.ArgumentParser(description='Deepfake Detection Tool')
    parser.add_argument('--video', type=str, help='Path to input video')
    parser.add_argument('--output', type=str, help='Path to output annotated video')
    parser.add_argument('--model_type', type=str, default='xception', 
                        choices=['xception', 'mesonet', 'efficientnet'], 
                        help='Type of model to use')
    parser.add_argument('--model_path', type=str, help='Path to pre-trained model weights')
    parser.add_argument('--sample_rate', type=int, default=30, help='Process every Nth frame')
    parser.add_argument('--download_models', action='store_true', 
                        help='Download available pre-trained models')
    
    args = parser.parse_args()
    
    if args.download_models:
        download_available_models()
        return
    
    if not args.video:
        parser.print_help()
        return
    
    detector = DeepfakeDetector(model_type=args.model_type, model_path=args.model_path)
    results = detector.analyze_video(args.video, args.output, args.sample_rate)
        
        print("\nDeepfake Detection Results:")
        print(f"Verdict: {results['verdict']}")
        print(f"Overall score: {results['overall_score']:.4f} (Higher = more likely to be fake)")
        print(f"Frames analyzed: {results['frames_analyzed']}")
        print(f"Faces detected: {results['faces_detected']}")
        print(f"Temporal inconsistency score: {results['temporal_inconsistencies']:.4f}")


if __name__ == "__main__":
    main()