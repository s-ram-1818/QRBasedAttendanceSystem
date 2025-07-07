import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-indigo-900 mb-4 text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to the QR Attendance System
      </motion.h1>

      {/* Description */}
      <motion.p
        className="text-center text-gray-700 max-w-2xl text-base sm:text-lg md:text-xl mb-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Effortlessly manage attendance using secure QR codes. Admins generate QR
        codes per subject, and students scan them to mark presence instantly.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          to="/login"
          className="bg-indigo-600 text-white text-lg font-medium px-8 py-3 rounded-full shadow-md hover:bg-indigo-700 transition duration-300 w-48 text-center"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-500 text-white text-lg font-medium px-8 py-3 rounded-full shadow-md hover:bg-green-600 transition duration-300 w-48 text-center"
        >
          Register
        </Link>
      </motion.div>

      {/* Features / Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl w-full px-4">
        {[
          {
            title: "📸 Instant QR Scan",
            desc: "Students scan and mark attendance in real-time—no manual errors, no delays.",
            delay: 0.1,
          },
          {
            title: "🧑‍🏫 Admin Dashboard",
            desc: "Create courses, generate QR codes, and view attendance reports by subject and date.",
            delay: 0.2,
          },
          {
            title: "🔒 Secure Access",
            desc: "Role-based login with secure JWT authentication to protect your data.",
            delay: 0.3,
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition duration-300"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 + card.delay }}
          >
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">
              {card.title}
            </h3>
            <p className="text-gray-600">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
