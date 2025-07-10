// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "../api";
import CourseForm from "../components/CourseForm";
import StudentList from "../components/StudentList";
import QRGenerator from "../components/QRGenerator";

const AdminDashboard = () => {
  const [view, setView] = useState("create");
  const [adminProfile, setAdminProfile] = useState({
    username: "Admin",
    email: "N/A",
    phone: "N/A",
  });

  const views = [
    { key: "create", label: "Create Course", color: "blue" },
    { key: "students", label: "Registered Students", color: "green" },
    { key: "qr", label: "Generate QR", color: "purple" },
  ];

  // Fetch admin profile
  useEffect(() => {
    axios
      .get("/profile", { withCredentials: true })
      .then((res) => setAdminProfile(res.data))
      .catch(() => {}); // Keep defaults on error
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await axios.post("/logout", {}, { withCredentials: true });
    window.location.href = "/";
  };

  // Render selected view
  const renderView = () => {
    if (view === "create") return <CourseForm />;
    if (view === "students") return <StudentList />;
    if (view === "qr") return <QRGenerator />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-300 to-blue-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">🛠 Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">
            Hello, <strong>{adminProfile.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <strong>👤 Name:</strong> {adminProfile.name || "N/A"}
          </div>
          <div>
            <strong>🧑 Username:</strong> {adminProfile.username || "N/A"}
          </div>
          <div>
            <strong>🎓 Role:</strong> {adminProfile.role || "N/A"}
          </div>
          <div>
            <strong>📧 Email:</strong> {adminProfile.email || "N/A"}
          </div>
          <div>
            <strong>📱 Phone:</strong> {adminProfile.phone || "N/A"}
          </div>
          <div>
            <strong>📅 Created:</strong>{" "}
            {adminProfile.createdAt
              ? new Date(adminProfile.createdAt).toLocaleDateString("en-IN")
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center flex-wrap gap-4 mb-8">
        {views.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2 rounded-2xl shadow-md transition
              ${
                view === key
                  ? `bg-blue-400 text-white`
                  : `bg-blue-400 hover:bg-${color}-700 text-white`
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto">{renderView()}</div>
    </div>
  );
};

export default AdminDashboard;
