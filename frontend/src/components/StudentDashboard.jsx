import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [student, setStudent] = useState({});
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showAvailable, setShowAvailable] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(false);

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
        const [coursesRes, attendanceRes, profileRes] = await Promise.all([
          axios.get("/fetch-courses", { withCredentials: true }),
          axios.get("/fetch-attendance", { withCredentials: true }),
          axios.get("/profile", { withCredentials: true }),
        ]);

        const attendanceMap = {};
        attendanceRes.data.forEach((entry) => {
          attendanceMap[entry.code] = {
            total: entry.total,
            present: entry.present,
            attendance: entry.attendance,
          };
        });

        const enriched = coursesRes.data.map((course) => ({
          ...course,
          totalClasses: attendanceMap[course.code]?.total || 0,
          presents: attendanceMap[course.code]?.present || 0,
          attendance: attendanceMap[course.code]?.attendance || [],
        }));

        setStudent(profileRes.data);
        setCourses(enriched);
        setAttendance(attendanceRes.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setFetchingCourses(true);
      const res = await axios.get("/available-courses", {
        withCredentials: true,
      });
      setAvailableCourses(res.data);
    } catch (err) {
      console.error("Available course load error:", err);
    } finally {
      setFetchingCourses(false);
    }
  };

  const handleRegisterCourse = async (code) => {
    try {
      await axios.post("/register-course", { code }, { withCredentials: true });
      alert("✅ Registered successfully!");

      // Remove from available list
      const updated = availableCourses.filter((c) => c.code !== code);
      setAvailableCourses(updated);

      // Refresh enrolled list
      const res = await axios.get("/fetch-courses", { withCredentials: true });
      const newCourse = res.data.find((c) => c.code === code);
      if (newCourse) {
        setCourses((prev) => [
          ...prev,
          { ...newCourse, totalClasses: 0, presents: 0, attendance: [] },
        ]);
      }
    } catch (err) {
      alert("❌ " + (err.response?.data || "Error registering"));
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
    } finally {
      navigate("/");
    }
  };

  const handleScan = () => navigate("/scan");

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4" />
          <p className="text-indigo-700 font-semibold text-lg">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 px-4 py-8 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-800">
              Welcome, {student.username || "Student"} 🎓
            </h1>
            <p className="text-sm text-gray-600 mt-1">{today}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm shadow transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-xl border p-6 shadow text-sm text-gray-800 mb-6">
          <div>
            <strong>👤 Name:</strong> {student.name || "N/A"}
          </div>
          <div>
            <strong>🧑 Username:</strong> {student.username || "N/A"}
          </div>
          <div>
            <strong>🎓 Role:</strong> {student.role || "N/A"}
          </div>
          <div>
            <strong>🆔 Roll No:</strong> {student.rollNo || "N/A"}
          </div>
          <div>
            <strong>📧 Email:</strong> {student.email || "N/A"}
          </div>
          <div>
            <strong>📱 Phone:</strong> {student.phone || "N/A"}
          </div>
          <div>
            <strong>📅 Created:</strong>{" "}
            {new Date(student.createdAt).toLocaleDateString("en-IN")}
          </div>
          <div>
            <strong>🕒 Last Updated:</strong>{" "}
            {new Date(student.updatedAt).toLocaleDateString("en-IN")}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <button
            onClick={() => {
              const toggle = !showAvailable;
              setShowAvailable(toggle);
              if (toggle) fetchAvailableCourses();
            }}
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            {showAvailable
              ? "Hide Available Courses"
              : "📚 Show Available Courses"}
          </button>

          <button
            onClick={handleScan}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm shadow transition"
          >
            📷 Scan Attendance
          </button>
        </div>

        {/* Available Courses */}
        {showAvailable && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-indigo-700 mb-3">
              Available Courses
            </h2>
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-indigo-50 text-indigo-800 font-semibold">
                  <tr>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Teacher</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchingCourses ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-gray-500 py-4"
                      >
                        Loading courses...
                      </td>
                    </tr>
                  ) : availableCourses.length > 0 ? (
                    availableCourses.map((course, i) => (
                      <tr key={i} className="border-t hover:bg-indigo-50">
                        <td className="px-4 py-2">{course.subject}</td>
                        <td className="px-4 py-2">{course.code}</td>
                        <td className="px-4 py-2">{course.teachername}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRegisterCourse(course.code)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Register
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-gray-500 py-4"
                      >
                        No available courses.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="overflow-x-auto bg-gray-50 rounded-xl shadow-inner">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-800 font-semibold border-b">
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
                  const isExpanded = expandedSubject === course.code;
                  const percent = course.totalClasses
                    ? ((course.presents / course.totalClasses) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <React.Fragment key={idx}>
                      <tr
                        role="button"
                        aria-expanded={isExpanded}
                        tabIndex={0}
                        onClick={() =>
                          setExpandedSubject(isExpanded ? null : course.code)
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            setExpandedSubject(isExpanded ? null : course.code);
                          }
                        }}
                        className="border-t hover:bg-indigo-50 cursor-pointer transition"
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
                      {isExpanded && course.attendance.length > 0 && (
                        <tr className="bg-indigo-50 text-sm">
                          <td colSpan="5" className="px-4 py-3">
                            <strong className="block mb-2 text-indigo-800">
                              Attendance Details:
                            </strong>
                            <ul className="list-disc ml-6 text-gray-700 space-y-1">
                              {course.attendance.map((att, i) => (
                                <li key={i}>
                                  <span className="font-medium">
                                    {att.date}
                                  </span>
                                  : {att.status}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
