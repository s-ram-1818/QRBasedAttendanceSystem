import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [student, setStudent] = useState({});
  const [courses, setCourses] = useState([]);
  const [newCode, setNewCode] = useState("");
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/fetch-courses", {
          withCredentials: true,
        });
        setCourses(res.data); // [{ subject, code, presents, totalClasses }]
      } catch (err) {
        console.error("Error loading dashboard", err);
      }
    };
    fetchData();
  }, []);

  const handleScan = () => {
    navigate("/scan");
  };

  const handleAddSubject = async () => {
    if (!newCode.trim()) return alert("Enter a course code");

    try {
      await axios.post(
        "/register-course",
        { code: newCode },
        { withCredentials: true }
      );
      alert("Course registered successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data || "Error registering course");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 px-6 py-12 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-indigo-800 text-center mb-2">
          Welcome, {student.username || "Student"} 🎓
        </h2>
        <p className="text-center text-gray-600 mb-6">{today}</p>

        {/* Student Info */}
        <div className="bg-gray-50 border p-4 rounded-xl mb-6 grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <strong>Roll No:</strong> {student.rollNo || "N/A"}
          </div>
          <div>
            <strong>Email:</strong> {student.email || "N/A"}
          </div>
          <div>
            <strong>Phone:</strong> {student.phone || "N/A"}
          </div>
        </div>

        {/* Add Subject */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Enter Course Code"
            className="px-4 py-2 border rounded-lg flex-1"
          />
          <button
            onClick={handleAddSubject}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            ➕ Add Subject
          </button>
        </div>

        {/* Scan Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleScan}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition"
          >
            📷 Scan Attendance
          </button>
        </div>

        {/* Enrolled Course Attendance Table */}
        <div className="bg-gray-50 rounded-xl shadow-inner overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-indigo-800 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-center">Presents</th>
                <th className="px-4 py-2 text-center">Total</th>
                <th className="px-4 py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course, idx) => {
                  const percent =
                    course.totalClasses > 0
                      ? ((course.presents / course.totalClasses) * 100).toFixed(
                          1
                        )
                      : "0.0";
                  return (
                    <tr
                      key={idx}
                      className="border-t hover:bg-indigo-50 transition"
                    >
                      <td className="px-4 py-2">{course.subject}</td>
                      <td className="px-4 py-2">{course.code}</td>
                      <td className="px-4 py-2 text-center">
                        {course.presents}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {course.totalClasses}
                      </td>
                      <td className="px-4 py-2 text-center font-semibold">
                        {percent}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No courses enrolled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
