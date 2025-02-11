import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [videoStream, setVideoStream] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
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

  const captureFrame = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");

    // Send the image data to the Flask server for processing
    axios
      .post("http://localhost:5000/process_frame", { image: imageData.split(',')[1] })
      .then((response) => {
        setProcessedImage(response.data.image);
      })
      .catch((error) => {
        console.error("Error processing the image:", error);
      });
  };

  return (
    <div>
      <h1>Face Detection and Recognition</h1>
      <video ref={videoRef} autoPlay playsInline width="640" height="480"></video>
      <button onClick={captureFrame}>Capture and Process</button>
      {processedImage && (
        <div>
          <h2>Processed Image</h2>
          <img src={`data:image/jpeg;base64,${processedImage}`} alt="Processed" />
        </div>
      )}
    </div>
  );
};

export default App;
