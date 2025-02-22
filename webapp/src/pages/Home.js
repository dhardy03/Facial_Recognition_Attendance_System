import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Hello World </h1>
      <nav>
        <ul>
          <li><Link to="/register">Register a Student</Link></li>
          <li><Link to="/recognition">Start Face Recognition</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
