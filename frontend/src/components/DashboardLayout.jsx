import React from "react";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }) {

  return (

    <div className="dashboard">

      <Navbar />

      <motion.div
        className="dashboard-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >

        {children}

      </motion.div>

    </div>

  );

}
