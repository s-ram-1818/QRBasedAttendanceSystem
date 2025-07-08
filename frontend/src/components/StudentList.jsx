// src/components/StudentList.jsx
import React, { useEffect, useState } from "react";
import axios from "../api";

const StudentList = () => {
  const [courses, setCourses] = useState([]);
  const [expandedCourseCodes, setExpandedCourseCodes] = useState([]);

  useEffect(() => {
    axios.get("/fetch-courses-admin", { withCredentials: true }).then((res) => {
      setCourses(res.data); // array of { subject, code, students }
    });
  }, []);

  const toggleExpand = (code) => {
    setExpandedCourseCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        📋 Attendance Report
      </h2>
      {courses.map((course) => (
        <div key={course.code} className="mb-4 border p-4 rounded-xl">
          <div
            className="cursor-pointer flex justify-between items-center"
            onClick={() => toggleExpand(course.code)}
          >
            <h3 className="font-bold text-lg">
              {course.subject} ({course.code})
            </h3>
            <span className="text-sm text-blue-600">
              {expandedCourseCodes.includes(course.code) ? "Hide" : "Show"}{" "}
              Students
            </span>
          </div>

          {expandedCourseCodes.includes(course.code) && (
            <ul className="list-disc ml-6 mt-2">
              {course.students.length > 0 ? (
                course.students.map((s, index) => (
                  <li key={index}>
                    {s.name} — Present: {s.present}, Absent: {s.absent}, Total:{" "}
                    {s.total}
                  </li>
                ))
              ) : (
                <li>No students registered</li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentList;
