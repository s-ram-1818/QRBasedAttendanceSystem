import React, { useEffect, useState } from "react";
import axios from "../api";

const StudentList = () => {
  const [courses, setCourses] = useState([]);
  const [expandedCourseCodes, setExpandedCourseCodes] = useState([]);

  useEffect(() => {
    axios
      .get("/fetch-courses-admin", { withCredentials: true })
      .then((res) => {
        setCourses(res.data); // array of { subject, code, students }
      })
      .catch((err) => {
        console.error("Failed to fetch course data:", err);
      });
  }, []);

  const toggleExpand = (code) => {
    setExpandedCourseCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-800">
          📋 Attendance Report
        </h2>

        {courses.length === 0 ? (
          <p className="text-center text-gray-600">No courses found.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course.code}
              className="mb-5 border border-indigo-100 rounded-xl shadow-sm bg-indigo-50"
            >
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer bg-indigo-100 hover:bg-indigo-200 rounded-t-xl transition"
                onClick={() => toggleExpand(course.code)}
              >
                <h3 className="font-semibold text-indigo-800">
                  {course.subject} ({course.code})
                </h3>
                <span className="text-sm text-indigo-600">
                  {expandedCourseCodes.includes(course.code)
                    ? "Hide Students ▲"
                    : "Show Students ▼"}
                </span>
              </div>

              {expandedCourseCodes.includes(course.code) && (
                <div className="bg-white px-4 py-3 rounded-b-xl">
                  {course.students.length > 0 ? (
                    <table className="w-full text-sm text-left table-auto">
                      <thead className="text-indigo-700 bg-indigo-50">
                        <tr>
                          <th className="px-2 py-1">#</th>
                          <th className="px-2 py-1">Name</th>
                          <th className="px-2 py-1 text-center">Present</th>
                          <th className="px-2 py-1 text-center">Absent</th>
                          <th className="px-2 py-1 text-center">Total</th>
                          <th className="px-2 py-1 text-center">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.students.map((s, index) => {
                          const percent = s.total
                            ? ((s.present / s.total) * 100).toFixed(1)
                            : "0.0";

                          return (
                            <tr
                              key={index}
                              className="border-t hover:bg-indigo-50"
                            >
                              <td className="px-2 py-1">{index + 1}</td>
                              <td className="px-2 py-1">{s.name}</td>
                              <td className="px-2 py-1 text-center">
                                {s.present}
                              </td>
                              <td className="px-2 py-1 text-center">
                                {s.absent}
                              </td>
                              <td className="px-2 py-1 text-center">
                                {s.total}
                              </td>
                              <td
                                className={`px-2 py-1 text-center font-semibold ${
                                  percent >= 75
                                    ? "text-green-600"
                                    : percent >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {percent}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 text-sm py-2">
                      No students registered.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentList;
