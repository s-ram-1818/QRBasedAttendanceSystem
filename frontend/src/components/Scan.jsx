// src/components/StudentList.jsx

import React, { useEffect, useState } from "react";
import axios from "../api";

const StudentList = () => {
  const [courses, setCourses] = useState([]); // Stores all courses with students
  const [expandedCourseCodes, setExpandedCourseCodes] = useState([]); // Stores codes of expanded courses

  // Fetch courses and enrolled students when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/fetch-courses-admin", {
          withCredentials: true,
        });
        setCourses(res.data); // Expected format: [{ subject, code, students: [{ name, present, absent, total }] }]
      } catch (err) {
        console.error("Error fetching course data", err);
      }
    };

    fetchCourses();
  }, []);

  // Toggle expanded view for a course
  const toggleExpand = (code) => {
    setExpandedCourseCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center text-indigo-800">
        📋 Attendance Report by Course
      </h2>

      {courses.map((course) => (
        <div
          key={course.code}
          className="mb-4 border border-indigo-200 p-4 rounded-xl shadow-sm bg-indigo-50"
        >
          {/* Course Header */}
          <div
            className="cursor-pointer flex justify-between items-center hover:bg-indigo-100 px-2 py-1 rounded-md transition"
            onClick={() => toggleExpand(course.code)}
          >
            <h3 className="font-bold text-lg text-indigo-900">
              {course.subject} ({course.code})
            </h3>
            <span className="text-sm text-indigo-600 font-medium">
              {expandedCourseCodes.includes(course.code) ? "Hide" : "Show"}{" "}
              Students
            </span>
          </div>

          {/* Student List */}
          {expandedCourseCodes.includes(course.code) && (
            <ul className="list-disc ml-6 mt-3 text-sm text-gray-800 space-y-1">
              {course.students?.length > 0 ? (
                course.students.map((s, index) => (
                  <li key={index}>
                    <strong>{s.name}</strong> — Present: {s.present}, Absent:{" "}
                    {s.absent}, Total: {s.total}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No students registered</li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentList;
