import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home.js";
import Register from "./pages/Register.js";
import Recognition from "./pages/Recognition.js";
import "./App.css";
import Analytics from "./pages/analytics";

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/recognition">Face Recognition</Link></li>
            <li><Link to="/analytics">Analytics</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recognition" element={<Recognition />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
