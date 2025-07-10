// Core Dependencies
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const QRCode = require("qrcode");
const cors = require("cors");

// DB & Models
const connectDB = require("./db");
const User = require("./models/user");
const Course = require("./models/course");
const Attendance = require("./models/attendance");
const { getAttendanceReportByCode } = require("./functions");

// Configurations
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "https://smart-attendance-11cg.onrender.com",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
connectDB(); // Connect MongoDB

// ------------------------
// 🔐 JWT Authentication Middleware
// ------------------------
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
}
// utils/getClientIP.js

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress
  );
}

// ------------------------
// 🔐 Role-Based Access Middleware
// ------------------------
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).send("Access denied");
    }
    next();
  };
}

// ------------------------
// 🚀 ROUTES START HERE
// ------------------------

// ✅ Welcome route
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// ✅ Register User (Student/Admin)
app.post("/register", async (req, res) => {
  const { name, username, password, email, phone, role, rollno } = req.body;

  const existing = await User.findOne({
    $or: [
      { username },
      { email },
      { phone },
      ...(role === "student" ? [{ rollNo: rollno }] : []),
    ],
  });

  if (existing) return res.status(400).send("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = {
    name,
    username,
    password: hashedPassword,
    email,
    phone,
    role,
  };

  if (role === "student") userData.rollNo = rollno;

  await new User(userData).save();
  res.status(201).send("User registered successfully");
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email: username }, { rollNo: username }],
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send("Invalid username or password");
  }

  const token = jwt.sign(
    { username: user.username, role: user.role, userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "None", // ✅ Important for cross-site cookies
    secure: true,
  });

  res.send("Login successful");
});

// ✅ Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.send("Logged out successfully");
});

// ✅ Create Course (Admin)
app.post(
  "/create-course",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const { teachername, subject, code } = req.body;
    if (!teachername || !subject || !code) {
      return res.status(400).send("All fields are required");
    }

    try {
      const exisiteing = await Course.findOne({ code, subject });
      if (exisiteing) return res.status(400).send("Course already exists");
      await new Course({
        user: req.user.userId,
        teachername,
        subject,
        code,
      }).save();
      res.status(201).send("Course created successfully");
    } catch (err) {
      res.status(500).send("Error creating course");
    }
  }
);

// ✅ Register Course (Student)
app.post(
  "/register-course",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const { code } = req.body;
    try {
      const course = await Course.findOne({ code });
      if (!course) return res.status(404).send("Course not found");
      if (course.students.includes(req.user.userId)) {
        return res.status(400).send("Already registered");
      }

      course.students.push(req.user.userId);
      await course.save();
      res.send("Successfully registered for the course");
    } catch {
      res.status(500).send("Error registering for course");
    }
  }
);

// ✅ Generate QR (Admin) & Mark all as Absent initially
const normalizeIP = (ip) => ip?.replace("::ffff:", "");

app.get(
  "/generate-qr",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Course code is required");

    try {
      const course = await Course.findOne({ code }, "students subject");
      if (!course) return res.status(404).send("Course not found");

      const date = new Date();

      const absentRecords = course.students.map((studentId) => ({
        student: studentId,
        subject: course.subject,
        code,
        date: date,
        status: "Absent",
      }));

      await Attendance.insertMany(absentRecords, { ordered: false });
      const adminIP = getClientIP(req);

      const token = jwt.sign(
        { code: code, ip: adminIP, date: date },
        process.env.QR_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const qrUrl = `${process.env.frontend_url}/mark-attendance?token=${token}`;
      const qrImage = await QRCode.toDataURL(qrUrl);

      res.json({ qr: qrImage });
    } catch (err) {
      res.status(500).send("Error generating QR");
    }
  }
);

// ✅ Student marks attendance via QR token
app.get(
  "/mark-attendance",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Token is required");

    try {
      const decoded = jwt.verify(token, process.env.QR_SECRET);
      const code = decoded.code;
      const adminIP = decoded.ip;
      const studentIP = getClientIP(req);
      if (normalizeIP(adminIP) !== normalizeIP(studentIP)) {
        return res.send(`you are not on required network`);
      }
      const alreadyMarked = await Attendance.findOne({
        student: req.user.userId,
        code,
        date: today,

        status: "Present",
      });
      if (alreadyMarked) {
        return res.status(400).send("✅ Already marked for this session");
      }

      const updated = await Attendance.findOneAndUpdate(
        { student: req.user.userId, code, status: "Absent", date: today },
        { status: "Present" },
        { new: true, sort: { date: -1 } }
      );

      if (!updated) return res.status(404).send("Attendance not started yet");
      res.send(`✅ Attendance marked for ${updated.subject}`);
    } catch {
      res.status(401).send("❌ Invalid or expired QR token");
    }
  }
);

// ✅ Fetch student attendance records
app.get(
  "/fetch-attendance",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const studentId = req.user.userId;
    const courses = await Course.find({ students: studentId }, "subject code");

    const attendance = await Attendance.find({
      student: studentId,
      subject: { $in: courses.map((c) => c.subject) },
    });

    const result = courses.map((course) => {
      const records = attendance.filter((a) => a.subject === course.subject);
      const total = records.length;
      const present = records.filter((a) => a.status === "Present").length;

      return {
        subject: course.subject,
        code: course.code,
        total,
        present,
        attendance: records.map((r) => ({
          date: r.date.toISOString().split("T")[0],
          status: r.status,
        })),
      };
    });

    res.json(result);
  }
);

// ✅ Fetch student’s registered courses
app.get(
  "/fetch-courses",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const courses = await Course.find(
      { students: req.user.userId },
      "subject code"
    );
    res.json(courses);
  }
);

// ✅ Fetch available courses for student
app.get(
  "/available-courses",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const courses = await Course.find({
      students: { $ne: req.user.userId },
    }).select("subject code teachername");

    res.json(courses);
  }
);

// ✅ Fetch admin’s courses + attendance report
app.get(
  "/fetch-courses-admin",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const courses = await Course.find({ user: req.user.userId }, "code");
      const reports = await Promise.all(
        courses.map((c) => getAttendanceReportByCode(c.code))
      );
      res.json(reports);
    } catch (err) {
      res.status(500).send("Error fetching admin reports");
    }
  }
);

// ✅ Profile route
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "username email phone rollNo role name createdAt updatedAt"
    );
    res.json(user);
  } catch {
    res.status(500).send("Failed to load profile");
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
