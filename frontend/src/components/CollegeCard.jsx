import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CollegeCard({ college }) {
  const navigate = useNavigate();

  const rating = college?.overallRating || 0;

  const handleClick = () => {
    console.log("Navigating to college:", college);

    if (!college || !college._id) {
      console.error("Invalid college ID:", college);
      return;
    }

    navigate(`/college/${college._id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className="card cursor-pointer"
      onClick={handleClick}
    >
      {/* College Image */}
      <img src={college.image} alt={college.name} />

      <div className="card-content">
        {/* Rating Circle */}
        <motion.div
          className="rating-circle"
          style={{ "--rating": rating }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {rating.toFixed(1)}
        </motion.div>

        {/* College Info */}
        <h3>{college.name}</h3>
        <p>{college.location}</p>
      </div>
    </motion.div>
  );
}