// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import page components
import Attendance from "./Attendance/Attendance";
import RegisterStudent from "./Register/RegisterStudent";

function App() {
  return (
    <Router>
      <div>
        <h1>Facial Recognition Attendance System</h1>

        {/* Define Navigation Links */}
        <nav>
          <ul>
            <li><a href="/">Attendance</a></li>
            <li><a href="/">Register Student</a></li>
          </ul>
        </nav>

        {/* Define Routes */}
        <Routes>
          <Route path="/Attendance" element={<Attendance />} />
          <Route path="/RegisterStudent" element={<RegisterStudent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
