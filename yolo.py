import os
import face_recognition
import torch
import cv2
import mysql
from database import save_face_db, get_db_connection

def load_yolo_model():
    """
    Load the YOLOv5 model using the PyTorch Hub.
    """
    print("Loading YOLOv5 model...")
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
    print("Model loaded successfully.")
    return model

def get_student_id_from_name(student_name):
    """
    Get the student ID from the database based on their name.
    """
    student_number = os.path.splitext(student_name)[0]
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT id FROM students WHERE student_number = %s", (student_number,))
        result = cursor.fetchone()
        return result[0] if result else None
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None
    finally:
        cursor.close()
        connection.close()

def load_known_faces(folder_path):
    """
    Load known face encodings and corresponding names from images in the folder.
    """
    print(f"Loading known faces from folder: {folder_path}")
    known_face_encodings = []
    known_face_names = []
    known_face_ids = []
    for file_name in os.listdir(folder_path):
        if file_name.endswith('.png'):
            image_path = os.path.join(folder_path, file_name)
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)
            student_id = get_student_id_from_name(file_name)
            if encodings and student_id is not None:
                known_face_encodings.append(encodings[0])
                known_face_names.append(file_name)
                known_face_ids.append(student_id)
    print(f"Loaded {len(known_face_encodings)} known faces.")
    return known_face_encodings, known_face_names, known_face_ids

def detect_and_recognize_faces(model, frame, known_face_encodings, known_face_names, known_face_ids, conf_threshold=0.5):
    """
    Detect and recognize faces, drawing bounding boxes with labels.
    """
    print("Starting face detection and recognition...")
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = model(frame_rgb)
    detections = results.pandas().xyxy[0]
    for _, row in detections.iterrows():
        if row['confidence'] >= conf_threshold and row['name'] == 'person':
            x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
            face_image = frame_rgb[y1:y2, x1:x2]
            if face_image.shape[0] > 0 and face_image.shape[1] > 0:
                resized_face_image = cv2.resize(face_image, (150, 150))
                face_encodings = face_recognition.face_encodings(resized_face_image)
                if face_encodings:
                    face_encoding = face_encodings[0]
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                    if True in matches:
                        match_index = matches.index(True)
                        name = known_face_names[match_index]
                        student_id = known_face_ids[match_index]
                        save_face_db(student_id, face_encoding)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    print("Face detection and recognition complete.")
    return frame

def main():
    print("Loading YOLO model...")
    model = load_yolo_model()
    folder_path = "known_faces"
    known_face_encodings, known_face_names, known_face_ids = load_known_faces(folder_path)
    print("Ready for face detection...")

if __name__ == "__main__":
    main()
