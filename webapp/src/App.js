import React from "react";
import {BrowserRouter as Router, Route, Routes, Link, Navigate} from "react-router-dom";
import Home from "./pages/Home.js";
import Register from "./pages/Register.js";
import Recognition from "./pages/Recognition.js";
import "./App.css";
import Analytics from "./pages/analytics";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recognition" element={<Recognition />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
    </Router>
  );
}

export default App;
