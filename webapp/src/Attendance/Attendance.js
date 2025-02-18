import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [videoStream, setVideoStream] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // To manage processing state
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

  // Function to capture the frame and send it to the backend
  const captureFrame = () => {
    if (!videoStream) {
      console.error("No video stream available");
      return;
    }

    // Create a canvas element to capture the video frame
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg"); // Convert to base64

    // Set processing state to show loading
    setIsProcessing(true);

    // Send the image data to the Flask backend for processing
    axios
      .post("http://localhost:5000/process_frame", { image: imageData.split(',')[1] })
      .then((response) => {
        setProcessedImage(response.data.image); // Set the processed image
        setIsProcessing(false); // Reset processing state
      })
      .catch((error) => {
        console.error("Error processing the image:", error);
        setIsProcessing(false); // Reset processing state on error
      });
  };

  return (
    <div>
      <h1>Face Detection and Recognition</h1>
      <video ref={videoRef} autoPlay playsInline width="640" height="480"></video>
      <button onClick={captureFrame} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Capture and Process"}
      </button>
      {processedImage && (
        <div>
          <h2>Processed Image</h2>
          <img src={`data:image/jpeg;base64,${processedImage}`} alt="Processed" />
        </div>
      )}
    </div>
  );
};

export default Attendance;
