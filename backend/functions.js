const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const QRCode = require("qrcode");
const cors = require("cors");

const connectDB = require("./db");
const User = require("./models/user");
const Attendance = require("./models/attendance");
const Course = require("./models/course");

async function getAttendanceReportByCode(code) {
  try {
    const course = await Course.findOne({ code });
    if (!course) {
      throw new Error("Course not found");
    }

    const { subject, students } = course;

    // Fetch student details (name)
    const studentDocs = await User.find(
      { _id: { $in: students } },
      "name username"
    );

    const report = await Promise.all(
      studentDocs.map(async (student) => {
        const records = await Attendance.find({
          student: student._id,
          subject,
        });

        const present = records.filter((r) => r.status === "Present").length;
        const total = records.length;
        const absent = total - present;

        return {
          name: student.name,
          rollNo: student.username,

          present,
          absent,
          total,
        };
      })
    );

    return {
      subject,
      code,
      students: report,
    };
  } catch (error) {
    console.error("Error in getAttendanceReportByCode:", error);
    throw error;
  }
}
module.exports = {
  getAttendanceReportByCode,
};
