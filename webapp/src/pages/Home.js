import React from "react";
import { Link } from "react-router-dom";
import Logo from "./resources/ReadingUniLogo.png"

function Home() {
  return (
      <div>
      <header className="Main-Section text-center py-5 text-white">
        <div className="container">
          <div className="bg-dark bg-opacity-50 p-4 rounded mx-auto" style={{ maxWidth: "1090px" }}>
            <h1 className="display-4 text-white">Welcome to the Student Attendance System</h1>
          </div>
          <p> </p>
          <Link to="/recognition" className="btn btn-danger btn-lg">Get Started</Link>
        </div>
      </header>

          <footer className="text-center py-3" style={{backgroundColor: "#92294a"}}>
              <p className="mb-0 text-white">Created by Daniel Hardy</p>
          </footer>
      </div>
  );
}

export default Home;
