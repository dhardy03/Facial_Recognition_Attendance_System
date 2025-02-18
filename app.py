from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2
import numpy as np
import mysql.connector
import base64
import os
import face_recognition
from yolo import load_yolo_model, detect_and_recognize_faces, load_known_faces
from database import get_db_connection, save_face_db


app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load YOLO model and known faces
model = load_yolo_model()
folder_path = "known_faces"  # Path to folder containing known face images
known_face_encodings, known_face_names, known_face_ids = load_known_faces(folder_path)

@app.route('/register_student', methods=['POST'])
def register_student():
    first_name = request.form['first_name']
    last_name = request.form['last_name']
    image_file = request.files['image']

    if not image_file:
        return jsonify({"error": "No image file provided"}), 400

    # Save image temporarily
    filename = f"{first_name}_{last_name}.png"
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(image_path)

    # Load image and extract face encoding
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)

    if not encodings:
        return jsonify({"error": "No face found in image"}), 400

    face_encoding = encodings[0]  # Take the first face found

    # Save student in database
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO students (first_name, last_name) VALUES (%s, %s)",
            (first_name, last_name)
        )
        student_id = cursor.lastrowid  # Get the generated student ID

        save_face_db(student_id, face_encoding)

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "Student registered successfully!"}), 201

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400

    finally:
        connection.close()

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

    return jsonify({'image': encoded_img})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
