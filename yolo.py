import os
import face_recognition
import torch
import cv2
import numpy as np
import pandas

from database import save_face_db, get_db_connection

def load_yolo_model():
    """
    Load the YOLOv5 model using the PyTorch Hub.
    """
    print("Loading YOLOv5 model...")
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s')  # Use yolov5s or any desired YOLOv5 model
    print("Model loaded successfully.")
    return model

def get_student_id_from_name(student_name):
    """
    Get the student ID from the database based on their name.

    Parameters:
        student_name (str): The name of the student.

    Returns:
        student_id (int or None): The student ID or None if not found.
    """
    # Split the name assuming the filename is in "firstname_lastname.png" format
    name_parts = student_name.split('_')
    if len(name_parts) < 2:
        print(f"Invalid filename format: {student_name}")
        return None

    first_name = name_parts[0]
    last_name = name_parts[1].split('.')[0]  # Remove the file extension

    # Connect to the database
    connection = get_db_connection()
    cursor = connection.cursor()

    # Query to get the student ID by their first and last name
    cursor.execute("SELECT id FROM students WHERE first_name = %s AND last_name = %s", (first_name, last_name))
    result = cursor.fetchone()

    cursor.close()
    connection.close()

    if result:
        return result[0]  # Return the student ID
    else:
        print(f"Warning: Student {first_name} {last_name} not found in the database.")
        return None  # Return None if the student is not found


def load_known_faces(folder_path):
    """
    Load known face encodings and their corresponding names from PNG files in a folder.

    Parameters:
        folder_path: Path to the folder containing PNG images of known faces.

    Returns:
        known_face_encodings: List of face encodings.
        known_face_names: List of names corresponding to the face encodings.
        known_face_ids: List of student IDs corresponding to the face encodings.
    """
    print(f"Loading known faces from folder: {folder_path}")
    known_face_encodings = []
    known_face_names = []
    known_face_ids = []  # Initialize the list for student IDs

    for file_name in os.listdir(folder_path):
        if file_name.endswith('.png'):
            print(f"Processing file: {file_name}")
            # Load the image and extract its encoding
            image_path = os.path.join(folder_path, file_name)
            image = face_recognition.load_image_file(image_path)
            encoding = face_recognition.face_encodings(image)

            # Get the student ID from the file name
            student_id = get_student_id_from_name(file_name)

            if encoding and student_id is not None:  # Ensure both encoding and student ID are found
                known_face_encodings.append(encoding[0])
                known_face_names.append(os.path.splitext(file_name)[0])  # Use file name as face name
                known_face_ids.append(student_id)  # Add student ID to the list
            else:
                print(f"No face encoding or student ID found for file: {file_name}")

    print(f"Loaded {len(known_face_encodings)} known faces.")
    return known_face_encodings, known_face_names, known_face_ids


def detect_and_recognize_faces(model, frame, known_face_encodings, known_face_names, known_face_ids, conf_threshold=0.5):
    """
    Detect faces in a video frame using YOLO and recognize them by comparing with known faces.

    Parameters:
        model: The loaded YOLOv5 model.
        frame: A single frame from the video feed.
        known_face_encodings: List of known face encodings.
        known_face_names: List of names corresponding to known face encodings.
        conf_threshold: Confidence threshold for filtering weak detections.

    Returns:
        frame: The frame with detected and recognized faces annotated.
    """
    print("Starting face detection and recognition...")
    # Convert the frame to RGB (YOLO expects RGB format)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Perform detection
    results = model(frame_rgb)
    print("YOLO detection results obtained.")

    # Extract detections
    detections = results.pandas().xyxy[0]  # Bounding box results in pandas DataFrame format

    for index, row in detections.iterrows():
        print(f"Detection {index}: {row}")
        if row['confidence'] >= conf_threshold:  # Apply confidence threshold
            if row['name'] == 'person':  # Assuming 'person' class for face detection
                print(f"Person detected with confidence {row['confidence']}")
                # Extract bounding box coordinates
                x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
                print(f"Bounding box: ({x1}, {y1}), ({x2}, {y2})")

                # Crop the face from the frame
                face_image = frame_rgb[y1:y2, x1:x2]
                print(f"Cropped face dimensions: {face_image.shape if face_image is not None else 'Invalid crop'}")

                # Validate the cropped face dimensions
                if face_image is not None and face_image.shape[0] > 0 and face_image.shape[1] > 0:
                    print("Face cropped successfully. Attempting recognition...")

                    # Resize the cropped face to a fixed size (e.g., 150x150) for encoding
                    resized_face_image = cv2.resize(face_image, (150, 150))
                    print(f"Resized face dimensions: {resized_face_image.shape}")

                    # Attempt to encode the face
                    face_encodings = face_recognition.face_encodings(resized_face_image)
                    print(f"Face encodings found: {len(face_encodings)}")

                    if face_encodings:  # If at least one face encoding is found
                        face_encoding = face_encodings[0]

                        # Compare the detected face to known faces
                        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                        print(f"Face matches: {matches}")
                        name = "Unknown"

                        # Use the name of the best match if any match is found
                        # Inside detect_and_recognize_faces() function
                        if True in matches:
                            match_index = matches.index(True)
                            name = known_face_names[match_index]
                            student_id = known_face_ids[match_index]  # Get the student ID for the recognized student

                            # Save the face to the database
                            if student_id:
                                save_face_db(student_id, face_encoding)  # Call the function to save the recognized face to DB

                            # Add bounding box and label
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                            cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                    else:
                        print("No face encoding found for the cropped face.")
                else:
                    print("Invalid face crop. Skipping recognition.")

    print("Face detection and recognition complete.")
    return frame

def main():
    # Load the YOLOv5 model
    model = load_yolo_model()

    # Load known faces
    folder_path = "known_faces"  # Path to folder containing PNG images of known faces
    known_face_encodings, known_face_names, known_face_ids = load_known_faces(folder_path)

    # Open a connection to the webcam (camera index 0)
    print("Accessing webcam...")
    cap = cv2.VideoCapture(0)  # Change index if you have multiple cameras

    if not cap.isOpened():
        print("Error: Unable to access the webcam.")
        return

    print("Webcam access successful. Starting live detection...")

    try:
        while True:
            # Capture a single frame from the webcam
            ret, frame = cap.read()
            if not ret:
                print("Error: Unable to read frame from webcam.")
                break

            # Perform face detection and recognition
            print("Processing a new frame...")
            detected_frame = detect_and_recognize_faces(model, frame, known_face_encodings, known_face_names)

            # Display the live feed with detections
            cv2.imshow("YOLOv5 Face Detection and Recognition", detected_frame)

            # Break the loop if the user presses 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("Quitting...")
                break
    finally:
        # Release resources
        print("Releasing resources...")
        cap.release()
        cv2.destroyAllWindows()

main()
