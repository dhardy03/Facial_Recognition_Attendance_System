import React from "react";
import { Link } from "react-router-dom";
import Logo from "./resources/ReadingUniLogo.png"

function Home() {
  return (
      <div>
          <nav className="navbar navbar-expand-lg" style={{backgroundColor: "#aaaaa5"}}>
              <div className="container">
                  <a className="navbar-brand text-white" href="#">Student Attendance System</a>
                  <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                      <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="container text-center">
                      <img src={Logo} alt="Logo" width={"154"} height={"50"} />
                  </div>
                  <div className="collapse navbar-collapse" id="navbarNav">
                      <ul className="navbar-nav ms-auto">
                          <li className="nav-item"><Link className="nav-link text-white" to="/register">Register</Link>
                          </li>
                          <li className="nav-item"><Link className="nav-link text-white" to="/analytics">Analytics</Link></li>
                          <li className="nav-item"><Link className="nav-link text-white" to="/recognition">Recognition</Link></li>
                      </ul>
                  </div>
              </div>
          </nav>

          <header className="Main-Section text-center py-5 text-white">
              <div className="container">
                  <h1 className="display-4 text-white">Welcome to the Student Attendance System</h1>
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
