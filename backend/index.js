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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

connectDB();

// ✅ Middleware: Authenticate JWT
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

// ✅ Middleware: Require role
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).send("Access denied");
    }
    next();
  };
}

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// ✅ Register route
app.post("/register", async (req, res) => {
  const { name, username, password, email, phone, role, rollno } = req.body;

  const existing = await User.findOne({
    $or: [
      { username },
      { email },
      { phone },
      // Only check rollNo if role is student

      ...(role === "student" ? [{ rollNo: rollno }] : []),
    ],
  });
  if (existing) return res.status(400).send("User already exists");

  const hashpass = await bcrypt.hash(password, 10);

  const userData = { name, username, password: hashpass, email, phone, role };

  if (role === "student") {
    userData.rollNo = rollno;
  }

  const user = new User(userData);
  await user.save();

  res.status(201).send("User registered successfully");
});

// ✅ Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email: username }, { rollNo: username }],
  });
  if (!user) return res.status(400).send("Invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send("Invalid username or password");

  const token = jwt.sign(
    { username: user.username, role: user.role, userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.send("Login successful");
});

// ✅ Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logged out successfully");
});

// ✅ Generate QR (Admin)
app.get(
  "/generate-qr",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const { subject } = req.query;
    if (!subject) return res.status(400).send("Subject is required");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // const existing = await Attendance.find({ subject, date: today });
    // if (existing.length > 0) {
    //   return res.status(400).send("Attendance already initialized for today");
    // }

    const students = await User.find({ role: "student" });
    const absentRecords = students.map((student) => ({
      student: student._id,
      subject,
      date: today,
      status: "Absent",
    }));

    try {
      await Attendance.insertMany(absentRecords, { ordered: false });
    } catch (err) {
      if (err.code !== 11000)
        return res.status(500).send("Error marking absents");
    }

    const token = jwt.sign({ subject }, process.env.QR_SECRET, {
      expiresIn: "15m",
    });
    const qrUrl = `http://localhost:3000/mark-attendance?token=${token}`;
    const qrImage = await QRCode.toDataURL(qrUrl);

    res.json({ qr: qrImage });
  }
);
app.get(
  "/fetch-courses",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const userId = req.user.userId;
    try {
      const courses = await Course.find({ students: userId }, "subject code");
      res.json(courses);
    } catch (err) {
      res.status(500).send("Error fetching courses");
    }
  }
);
app.get(
  "/fetch-attendance",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const userId = req.user.userId;
    const courses = await Course.find({ students: userId }, "subject code");
    if (!courses || courses.length === 0) {
      return res.status(404).send("No courses found for this student");
    }
    const attendanceRecords = await Attendance.find({
      student: userId,
      subject: { $in: courses.map((c) => c.subject) },
    });
    const attendanceData = courses.map((course) => {
      const records = attendanceRecords.filter(
        (record) => record.subject === course.subject
      );

      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;

      return {
        subject: course.subject,
        code: course.code,
        total,
        present,
        attendance: records.map((record) => ({
          date: record.date.toISOString().split("T")[0],
          status: record.status,
        })),
      };
    });

    res.json(attendanceData);
  }
);
// ✅ Mark Attendance (Student)
app.get(
  "/mark-attendance",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Token is required");

    try {
      const decoded = jwt.verify(token, process.env.QR_SECRET);
      const subject = decoded.subject;
      const studentId = req.user.userId;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await Attendance.findOneAndUpdate(
        { student: studentId, subject, date: today },
        { status: "Present" },
        { new: true }
      );

      if (!result) {
        return res
          .status(404)
          .send("Attendance not started yet for this subject.");
      }

      res.send(`✅ Attendance marked for ${subject}`);
    } catch (err) {
      res.status(401).send("❌ Invalid or expired QR token");
    }
  }
);

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
      const course = new Course({ teachername, subject, code });
      await course.save();
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
    if (!code) {
      return res.status(400).send("Course code is required");
    }

    try {
      const course = await Course.findOne({ code });
      if (!course) return res.status(404).send("Course not found");

      if (course.students.includes(req.user.userId)) {
        return res.status(400).send("Already registered for this course");
      }

      course.students.push(req.user.userId);
      await course.save();

      res.send("Successfully registered for the course");
    } catch (err) {
      res.status(500).send("Error registering for course");
    }
  }
);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
