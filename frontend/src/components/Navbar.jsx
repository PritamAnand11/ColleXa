import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ setSidebarOpen, setProfileOpen }) {

  return (

    <div className="navbar-wrapper">

      <div className="navbar-container">

        <div className="logo">

          {/* SIDEBAR TOGGLE BUTTON */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            style={{
              fontSize: "22px",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginRight: "10px"
            }}
          >
            ☰
          </button>

          <Link to="/" className="logo-link">
            Collexa
          </Link>

        </div>


        <div className="nav-links">

          <Link to="/">Home</Link>

          <Link to="/compare">Compare</Link>

          <Link to="/login">Login</Link>

          <Link to="/register">Register</Link>

          <ThemeToggle />

          {/* PROFILE AVATAR BUTTON */}
          <button
            onClick={() => setProfileOpen(true)}
            title="My Profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              marginLeft: "10px",
              boxShadow: "0 2px 8px rgba(124,58,237,0.35)"
            }}
          >
            👤
          </button>

        </div>

      </div>

    </div>

  );
}