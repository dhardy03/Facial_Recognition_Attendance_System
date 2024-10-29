#imports
import cv2
import numpy as np
import os
import google.cloud as vision


#Init Google Vision API
client = vision.ImageAnnotatorClient()

def detect_faces(content):
    """Detects Faces"""
    image = vision.Image(content=content)
    response = client.face_detection(image=image)
    faces = response.face_annotations

    face_boundaries = []
    for face in faces:
        vertices = [(vertex.x, vertex.y) for vertex in face.bounding_poly.vertices]
        face_boundaries.append(vertices)

    return face_boundaries

def main():
    """Start Camera Capture"""
    capture = cv2.VideoCapture(0)

    while True:
        ret, frame = capture.read()
        if not ret:
            print("Failed to capture")
            break
    
    """Convert Frame to JPG"""
    ret, img_encoded = cv2.imencode('.jpg', frame)

    """To bytes for api"""
    content = img_encoded.tobytes()

    """Detect face in frame using google vision"""
    face_boundaries = detect_faces(content)

    """Draw boxes"""
    for vertices in face_boundaries:
        pts = np.array(vertices, np.int32)
        pts = pts.reshape((-1,1,2))
        cv2.polylines(frame, [pts], isClosed=True, color=(0, 255, 0), thickness=2)

    """Display"""
    cv2.imshow("Face Detection", frame)

    """Release"""
    capture.release()
    cv2.destroyAllWindows()

main()