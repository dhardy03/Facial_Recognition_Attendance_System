import tkinter as tk
from tkinter import Label, Button
import cv2
import threading
from yolo import load_yolo_model, load_known_faces, detect_and_recognize_faces


class YOLOGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("YOLO Face Detection and Recognition")
        self.root.geometry("400x200")

        self.label = Label(root, text="YOLO Face Recognition GUI", font=("Arial", 14))
        self.label.pack(pady=10)

        self.start_button = Button(root, text="Start Detection", command=self.start_detection, font=("Arial", 12))
        self.start_button.pack(pady=5)

        self.stop_button = Button(root, text="Stop Detection", command=self.stop_detection, font=("Arial", 12),
                                  state=tk.DISABLED)
        self.stop_button.pack(pady=5)

        self.running = False
        self.model = load_yolo_model()
        self.known_face_encodings, self.known_face_names = load_known_faces("known_faces")

    def detection_loop(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Unable to access the webcam.")
            return

        while self.running:
            ret, frame = cap.read()
            if not ret:
                break
            frame = detect_and_recognize_faces(self.model, frame, self.known_face_encodings, self.known_face_names)
            cv2.imshow("YOLO Face Recognition", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    def start_detection(self):
        self.running = True
        self.start_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.NORMAL)
        self.thread = threading.Thread(target=self.detection_loop)
        self.thread.start()

    def stop_detection(self):
        self.running = False
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        if hasattr(self, "thread"):
            self.thread.join()


if __name__ == "__main__":
    root = tk.Tk()
    app = YOLOGUI(root)
    root.mainloop()
