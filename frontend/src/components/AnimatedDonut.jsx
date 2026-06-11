import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444"
];

export default function AnimatedDonut({ data }) {

  return (

    <motion.div
      initial={{ rotate: -90 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 0.8 }}
    >

      <PieChart width={300} height={300}>

        <Pie
          data={data}
          innerRadius={80}
          outerRadius={120}
          dataKey="value"
        >

          {data.map((entry, index) => (

            <Cell
              key={index}
              fill={COLORS[index]}
            />

          ))}

        </Pie>

      </PieChart>

    </motion.div>

  );

}