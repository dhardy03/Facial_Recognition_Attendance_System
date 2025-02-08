from flask import Flask, jsonify, request
import cv2
import torch
import face_recognition
import numpy as np
from io import BytesIO
import base64

app = Flask(__name__)

# Load YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'yolov5s')

# Dummy known faces for recognition (modify as needed)
known_face_encodings = ["known_faces/Dan.png"]  # You would load actual encodings here
known_face_names = ['Dan']  # Corresponding names for recognition


@app.route('/process_frame', methods=['POST'])
def process_frame():
    # Get the image from the POST request
    data = request.json
    img_data = base64.b64decode(data['image'])  # Get the image from frontend
    np_img = np.frombuffer(img_data, dtype=np.uint8)
    frame = cv2.imdecode(np_img, 1)  # Decode image from buffer

    # Convert to RGB as YOLO expects RGB format
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # YOLO detection
    results = model(frame_rgb)
    detections = results.pandas().xyxy[0]

    # Face recognition logic (assuming detected faces are recognized correctly)
    # Return the processed frame as a base64 string to the frontend
    _, buffer = cv2.imencode('.jpg', frame)  # Encode the frame back to image
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return jsonify({'image': encoded_img})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
