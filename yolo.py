import csv
import os
from datetime import datetime
import face_recognition
import torch
import cv2
import mysql.connector
import numpy as np
import base64
from database import save_face_db, get_db_connection


def load_yolo_model():
    print("Loading YOLOv5 face detection model...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = torch.hub.load('ultralytics/yolov5', 'custom', path='yolov5n.pt').to(device)
    print("Model loaded successfully on", device)
    return model


def get_student_id_from_name(student_name):
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
    print(f"Loading known faces from folder: {folder_path}")
    known_face_encodings = []
    known_face_names = []
    known_face_ids = []

    for file_name in os.listdir(folder_path):
        if file_name.endswith(('.png', '.jpg')):
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


def detect_and_recognise_faces(model, frame, known_face_encodings, known_face_names, known_face_ids,
                               conf_threshold=0.5):
    print("Starting face detection and recognition...")
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = model(frame_rgb)
    detections = results.pandas().xyxy[0]
    recognized_students = []

    TP = 0
    FP = 0
    FN = 0

    for _, row in detections.iterrows():
        if row['confidence'] >= conf_threshold:
            x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
            print(f"Detected face with confidence {row['confidence']} at ({x1}, {y1}), ({x2}, {y2})")

            face_image = frame_rgb[y1:y2, x1:x2]
            if face_image.shape[0] > 0 and face_image.shape[1] > 0:
                resized_face_image = cv2.resize(face_image, (150, 150))
                face_encodings = face_recognition.face_encodings(resized_face_image)
                print(f"Number of encodings found in region ({x1}, {y1}), ({x2}, {y2}): {len(face_encodings)}")

                for i, face_encoding in enumerate(face_encodings):
                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    best_match_index = np.argmin(face_distances)
                    print(f"Checking face {i + 1} out of {len(face_encodings)} in region ({x1}, {y1}), ({x2}, {y2})")
                    print(f"Face distance: {face_distances[best_match_index]}")

                    if face_distances[best_match_index] < 0.65:
                        name = known_face_names[best_match_index]
                        student_id = known_face_ids[best_match_index]
                        save_face_db(student_id, face_encoding)

                        if student_id not in recognized_students:
                            recognized_students.append(student_id)
                            print(f"Match found: {name} (ID: {student_id}) at ({x1}, {y1}), ({x2}, {y2})")
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                            cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                        TP += 1
                    else:
                        FP += 1
                else:
                    FN += 1

    precision = TP / (TP + FP) if TP + FP > 0 else 0
    recall = TP / (TP + FN) if TP + FN > 0 else 0
    f1_score = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0

    print("Face detection and recognition complete.")
    print(f"Precision: {precision:.2f}, Recall: {recall:.2f}, F1-Score: {f1_score:.2f}")

    csv_file = 'performance_metrics.csv'
    file_exists = os.path.isfile(csv_file)
    with open(csv_file, mode='a', newline='') as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(['Timestamp', 'Precision', 'Recall', 'F1-Score'])
        writer.writerow([datetime.now().isoformat(), f"{precision:.2f}", f"{recall:.2f}", f"{f1_score:.2f}"])

    _, buffer = cv2.imencode('.jpg', frame)
    processed_image_base64 = base64.b64encode(buffer).decode('utf-8')
    return processed_image_base64, recognized_students


def main():
    print("Loading YOLO model...")
    model = load_yolo_model()
    folder_path = "known_faces"
    known_face_encodings, known_face_names, known_face_ids = load_known_faces(folder_path)
    print("Ready for face detection...")


if __name__ == "__main__":
    main()
