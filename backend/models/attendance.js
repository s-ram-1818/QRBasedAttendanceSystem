const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: { type: String, required: true },
  code: {
    type: String,
    required: true,
    // Ensure each attendance record is unique per student and subject
  },
  date: {
    type: Date,
    default: Date.now, // Automatically set to current date
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
    default: "Absent",
  },
});

// attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
