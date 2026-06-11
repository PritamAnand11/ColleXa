import React, {
  useEffect,
  useState,
  useContext
} from "react";

import axios from "axios";
import AdminVerification from "../components/AdminVerification";
import { AuthContext } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [colleges, setColleges] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const API = "http://localhost:5000/api/colleges";

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`
    }
  };

  const loadColleges = async () => {
    try {
      const res = await axios.get(API);
      setColleges(res.data);
    } catch (error) {
      console.log("Error loading colleges:", error);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const addCollege = async () => {
    if (!name || !location) {
      alert("Please enter both college name and location");
      return;
    }

    try {
      await axios.post(
        API,
        { name, location },
        config
      );

      setName("");
      setLocation("");
      loadColleges();
    } catch (error) {
      console.log("Error adding college:", error);
    }
  };

  const deleteCollege = async (id) => {
    try {
      await axios.delete(
        `${API}/${id}`,
        config
      );

      loadColleges();
    } catch (error) {
      console.log("Error deleting college:", error);
    }
  };

  return (
    <div style={{ padding: 40 }}>

      <h1>Admin Dashboard</h1>

      {/* ============================= */}
      {/* Unfiltered Mode Verification */}
      {/* ============================= */}
      <AdminVerification />

      <hr style={{ margin: "30px 0" }} />

      {/* ============================= */}
      {/* Add College Section */}
      {/* ============================= */}
      <h3>Add College</h3>

      <input
        type="text"
        placeholder="College Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: 10,
          marginRight: 10,
          marginBottom: 10
        }}
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{
          padding: 10,
          marginRight: 10,
          marginBottom: 10
        }}
      />

      <button
        onClick={addCollege}
        style={{
          padding: "10px 20px",
          cursor: "pointer"
        }}
      >
        Add College
      </button>

      <hr style={{ margin: "30px 0" }} />

      {/* ============================= */}
      {/* All Colleges Section */}
      {/* ============================= */}
      <h3>All Colleges</h3>

      {colleges.length === 0 ? (
        <p>No colleges found</p>
      ) : (
        colleges.map((c) => (
          <div
            key={c._id}
            style={{
              padding: 12,
              marginBottom: 10,
              border: "1px solid #ddd",
              borderRadius: 8
            }}
          >
            <strong>{c.name}</strong> ({c.location})

            <button
              onClick={() => deleteCollege(c._id)}
              style={{
                marginLeft: 15,
                padding: "6px 14px",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}