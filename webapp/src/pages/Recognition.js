import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const Recognition = () => {
  const [videoStream, setVideoStream] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [classOptions, setClassOptions] = useState([]);
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setVideoStream(stream);
        })
        .catch((err) => console.log("Error accessing webcam:", err));
    }
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/classes")
      .then(response => {
        if (response.data.classes) {
          setClassOptions(response.data.classes);
        } else {
          console.error("Invalid response format:", response.data);
        }
      })
      .catch(error => console.error("Error fetching classes from MySQL:", error));
  }, []);

  const captureFrame = () => {
    if (!videoStream) {
      console.error("No video stream available");
      return;
    }
    if (!selectedClass) {
      alert("Please select a class before capturing an image.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");

    setIsProcessing(true);

    axios
      .post("http://localhost:5000/recognition", {
        page: "recognition",
        image: imageData.split(',')[1],
        class_id: selectedClass,
      }, {
        headers: { "Content-Type": "application/json" }
      })
      .then((response) => {
        console.log("Received Data:", response.data);

        if (response.data.recognized_students) {
          setRecognizedStudents(response.data.recognized_students);
        }

        if (response.data.image) {
          setProcessedImage(`data:image/jpeg;base64,${response.data.image}`);
        }

        setIsProcessing(false);
      })
      .catch((error) => {
        console.error("Error processing the image:", error);
        setIsProcessing(false);
      });
  };

  return (
    <div>
      <h1>Face Detection and Recognition</h1>
      <video ref={videoRef} autoPlay playsInline width="640" height="480"></video>

      <div>
        <label>Select Class: </label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">--Choose a class--</option>
          {classOptions.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
          ))}
        </select>
      </div>

      <button onClick={captureFrame} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Capture and Process"}
      </button>

      {recognizedStudents.length > 0 && (
        <div>
          <h2>Recognized and Enrolled Students</h2>
          <ul>
            {recognizedStudents.map((student, index) => (
              <li key={index}>{student.name} (ID: {student.number}) - Enrolled</li>
            ))}
          </ul>
        </div>
      )}

      {processedImage && (
        <div>
          <h2>Processed Image</h2>
          <img src={processedImage} alt="Processed" width="640" height="480" />
        </div>
      )}
    </div>
  );
};

export default Recognition;
