from _mysql_connector import MySQL
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_mysqldb import MySQL
import cv2
import numpy as np
from io import BytesIO
import base64
from yolo import load_yolo_model, detect_and_recognize_faces, load_known_faces

app = Flask(__name__)

# Configure MySQL connection
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'dan'
app.config['MYSQL_PASSWORD'] = '12345678'
app.config['MYSQL_DB'] = 'face_recognition'
mysql = MySQL(app)

# Enable CORS for all routes
CORS(app)

# Load YOLO model and known faces
model = load_yolo_model()
folder_path = "known_faces"  # Path to folder containing known face images
known_face_encodings, known_face_names = load_known_faces(folder_path)

@app.route('/process_frame', methods=['POST'])
def process_frame():
    # Get the image from the POST request
    data = request.json
    img_data = base64.b64decode(data['image'])  # Get the image from frontend
    np_img = np.frombuffer(img_data, dtype=np.uint8)
    frame = cv2.imdecode(np_img, 1)  # Decode image from buffer

    # Perform face detection and recognition
    detected_frame = detect_and_recognize_faces(model, frame, known_face_encodings, known_face_names)

    # Encode the processed frame back to image
    _, buffer = cv2.imencode('.jpg', detected_frame)  # Encode the frame back to image
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    # Interact with the database
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
    results = cur.fetchall()

    return jsonify({'image': encoded_img}), jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
