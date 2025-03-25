import React, { useState, useRef } from "react";
import axios from "axios";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const startCamera = async () => {
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCapturedImage(canvasRef.current.toDataURL("image/png"));

      canvas.toBlob((blob) => {
        const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });
        setPhoto(file);
        setUseCamera(false);
      }, "image/jpeg");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !photo || !studentNumber) {
      setMessage("Please fill all fields and upload a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("student_number", studentNumber);
    formData.append("image", photo);

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Error registering student");
    }
    setLoading(false);
  };

  return (
<div className="container py-5">
      <div style={{ backgroundColor: "#d30031", color: "white", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
        <h2 className="mb-0">Register Student</h2>
      </div>

      <div className="bg-light p-4 mt-3 rounded shadow">
        <form onSubmit={handleRegister} className="text-center">
          <div className="mb-3">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="form-control w-50 mx-auto"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="form-control w-50 mx-auto"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Student Number"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              required
              className="form-control w-50 mx-auto"
            />
          </div>

          {!useCamera && !capturedImage && (
            <div className="mb-3">
              <input type="file" accept="image/*" onChange={handlePhotoChange} required className="form-control w-50 mx-auto" />
              <button type="button" onClick={startCamera} className="btn btn-secondary mt-2">
                Use Camera
              </button>
            </div>
          )}

          {useCamera && (
          <div className="mb-3 text-center">
            <video ref={videoRef} autoPlay className="border rounded shadow w-50 d-block mx-auto" />

            <button type="button" onClick={capturePhoto} className="btn btn-warning mt-2">
              Capture Photo
            </button>

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}

          {capturedImage && (
            <div className="mb-3">
              <h5>Captured Photo:</h5>
              <img src={capturedImage} alt="Captured" className="border rounded shadow w-50" />
            </div>
          )}

          <button type="submit" className="btn btn-primary mt-3 px-4 py-2" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && <p className="mt-3 text-success">{message}</p>}
      </div>
    </div>
  );
}

export default Register;