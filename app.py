from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2
import numpy as np
import mysql.connector
import base64
import os
import face_recognition
from PIL import Image
from yolo import load_yolo_model, detect_and_recognize_faces, load_known_faces
from database import get_db_connection, save_face_db

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Define the folder where uploaded images will be stored
UPLOAD_FOLDER = "known_faces"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load YOLO model and known faces only when needed
model = None
known_face_encodings = []
known_face_names = []
known_face_ids = []


def load_face_recognition():
    global model, known_face_encodings, known_face_names, known_face_ids
    if model is None:
        model = load_yolo_model()
    update_face_recognition()


def update_face_recognition():
    global known_face_encodings, known_face_names, known_face_ids
    known_face_encodings = []
    known_face_names = []
    known_face_ids = []

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT student_number, first_name, last_name FROM students")
    students = cursor.fetchall()
    cursor.close()
    connection.close()

    for student_number, first_name, last_name in students:
        image_path = os.path.join(UPLOAD_FOLDER, f"{student_number}.png")
        if os.path.exists(image_path):
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                known_face_encodings.append(encodings[0])
                known_face_names.append(f"{first_name} {last_name}")
                known_face_ids.append(student_number)


@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Facial Recognition System API"})


@app.route('/register', methods=['POST'])
def register_student():
    try:
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        student_number = request.form.get('student_number', '').strip()
        image_file = request.files.get('image')

        if not first_name or not last_name or not student_number:
            return jsonify({"error": "Missing required fields"}), 400

        if not image_file:
            return jsonify({"error": "No image file provided"}), 400

        # Save image temporarily
        filename = f"{student_number}.png"
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(image_path)

        # Validate the image before processing
        try:
            with Image.open(image_path) as img:
                img.verify()
        except Exception:
            os.remove(image_path)
            return jsonify({"error": "Uploaded file is not a valid image"}), 400

        # Load image and extract face encoding
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)

        if not encodings:
            os.remove(image_path)
            return jsonify({"error": "No face found in image"}), 400

        face_encoding = encodings[0]

        # Save student in database
        connection = get_db_connection()
        cursor = connection.cursor()

        try:
            cursor.execute(
                "INSERT INTO students (first_name, last_name, student_number) VALUES (%s, %s, %s)",
                (first_name, last_name, student_number)
            )
            student_id = cursor.lastrowid
            save_face_db(student_id, face_encoding)
            connection.commit()

            # Update facial recognition after new registration
            update_face_recognition()

            return jsonify({"message": "Student registered successfully! Facial recognition updated."}), 201
        except mysql.connector.Error as err:
            connection.rollback()
            return jsonify({"error": str(err)}), 500
        finally:
            cursor.close()
            connection.close()

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/recognition', methods=['POST'])
def process_frame():
    try:
        data = request.json
        if data.get('page') != 'recognition':
            return jsonify({"error": "Face recognition is only available on the recognition page"}), 400

        class_id = data.get('class_id')
        if not class_id:
            return jsonify({"error": "Class ID is required for enrollment"}), 400

        load_face_recognition()

        img_data = base64.b64decode(data.get('image', ''))
        if not img_data:
            print("ERROR: No image data received.")
            return jsonify({"error": "Invalid image data"}), 400

        np_img = np.frombuffer(img_data, dtype=np.uint8)
        frame = cv2.imdecode(np_img, 1)
        if frame is None:
            print("ERROR: Failed to decode image.")
            return jsonify({"error": "Failed to decode image"}), 400

        processed_image_base64, recognized_students = detect_and_recognize_faces(model, frame, known_face_encodings,
                                                                                 known_face_names, known_face_ids)

        if not processed_image_base64:
            print("ERROR: Processed image encoding failed.")
            return jsonify({"error": "Failed to process image"}), 500

        connection = get_db_connection()
        cursor = connection.cursor()

        enrolled_students = []
        for student_number in recognized_students:
            cursor.execute("SELECT id, first_name, last_name FROM students WHERE student_number = %s",
                           (student_number,))
            student = cursor.fetchone()
            if student:
                student_id, first_name, last_name = student
                full_name = f"{first_name} {last_name}"
                cursor.execute("SELECT student_number FROM enrollments WHERE student_number = %s AND class_id = %s",
                               (student_number, class_id))
                existing_enrollment = cursor.fetchone()

                if not existing_enrollment:
                    cursor.execute(
                        "INSERT INTO enrollments (student_id, student_number, class_id, date) VALUES (%s, %s, %s, NOW())",
                        (student_id, student_number, class_id))
                    connection.commit()
                    enrolled_students.append({"name": full_name, "number": student_number})

        cursor.close()
        connection.close()

        print("Processed image successfully generated and sent.")
        return jsonify({
            'message': "Recognition processed and enrollments updated.",
            'recognized_students': enrolled_students,
            'image': processed_image_base64
        })
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
