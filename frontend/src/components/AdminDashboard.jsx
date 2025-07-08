import React, { useState } from "react";
import CourseForm from "./CourseForm";
import StudentList from "./StudentList";

import QRGenerator from "./QRGenerator";

const AdminDashboard = () => {
  const [view, setView] = useState("create");

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-300 to-blue-200 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        🛠 Admin Dashboard
      </h1>

      <div className="flex justify-center space-x-4 mb-8 flex-wrap">
        <button
          onClick={() => setView("create")}
          className="px-4 py-2 bg-blue-600 text-white rounded-2xl shadow-md hover:bg-blue-700"
        >
          Create Course
        </button>
        <button
          onClick={() => setView("students")}
          className="px-4 py-2 bg-green-600 text-white rounded-2xl shadow-md hover:bg-green-700"
        >
          Registered Students
        </button>

        <button
          onClick={() => setView("qr")}
          className="px-4 py-2 bg-purple-600 text-white rounded-2xl shadow-md hover:bg-purple-700"
        >
          Generate QR
        </button>
      </div>

      {view === "create" && <CourseForm />}
      {view === "students" && <StudentList />}
      {view === "report" && <AttendanceReport />}
      {view === "qr" && <QRGenerator />}
    </div>
  );
};

export default AdminDashboard;
