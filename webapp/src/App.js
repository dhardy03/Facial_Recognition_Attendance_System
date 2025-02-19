import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home.js";
import Register from "./pages/Register.js";
import Recognition from "./pages/Recognition.js";
import "./App.css";

function App() {
  return (
    <Router>
      console.log("App is rendering...");
      <div className="app">
        <nav>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/recognition">Face Recognition</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recognition" element={<Recognition />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
