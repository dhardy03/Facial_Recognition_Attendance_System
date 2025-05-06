import React from "react";
import {BrowserRouter as Router, Route, Routes, Link, Navigate} from "react-router-dom";
import Home from "./pages/Home.js";
import Register from "./pages/Register.js";
import Recognition from "./pages/Recognition.js";
import Overall from "./pages/Overall.js";
import "./App.css";
import Analytics from "./pages/analytics";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "./pages/resources/ReadingUniLogo.png";

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#aaaaa5" }}>
        <div className="container">
          <Link className="navbar-brand text-white" to="/">Student Attendance System</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="container text-center">
            <img src={Logo} alt="Logo" width="154" height="50" />
          </div>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link text-white" to="/register">Register</Link></li>

              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle text-white" role="button" data-bs-toggle="dropdown">
                  Analytics
                </span>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/analytics">Student</Link></li>
                  <li><Link className="dropdown-item" to="/Overall">Overall</Link></li>
                </ul>
              </li>

              <li className="nav-item"><Link className="nav-link text-white" to="/recognition">Recognition</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recognition" element={<Recognition />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/Overall" element={<Overall />} />
      </Routes>
    </Router>
  );
}

export default App;

