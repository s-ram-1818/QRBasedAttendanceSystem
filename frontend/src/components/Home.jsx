import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api";

const features = [
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
];

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/profile", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error("Logout failed");
    }
  };

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 🔥 Heading */}
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-4 text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to the QR Attendance System
      </motion.h1>

      {/* 🔍 Subheading */}
      <motion.p
        className="text-center text-gray-700 max-w-2xl text-lg md:text-xl mb-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Effortlessly manage attendance using secure QR codes. Admins generate QR
        codes per subject, and students scan them to mark presence instantly.
      </motion.p>

      {/* 👤 Auth Actions */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {user ? (
          <div className="w-full text-center space-y-4">
            <p className="text-lg font-medium text-gray-800">
              Hello, <strong>{user.username}</strong> 👋
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  navigate(
                    user.role === "admin"
                      ? "/admin-dashboard"
                      : "/student-dashboard"
                  )
                }
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow transition"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link
              to="/login"
              className="w-full sm:w-1/2 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium px-6 py-3 rounded-full shadow-md transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-1/2 text-center bg-green-500 hover:bg-green-600 text-white text-lg font-medium px-6 py-3 rounded-full shadow-md transition duration-300"
            >
              Register
            </Link>
          </div>
        )}
      </motion.div>

      {/* 🌟 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl w-full px-4">
        {features.map((card, idx) => (
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
