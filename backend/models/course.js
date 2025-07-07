const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  teachername: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true, // Ensure course code is unique
  },
  students: [
    {
      type: String, // ✅ Correct way to reference a user // Reference to User model
      unique: true, // Ensure each student can only be registered once
    },
  ],
});
courseSchema.index({ code: 1 }, { unique: true }); // Ensure course code is unique

module.exports = mongoose.model("Course", courseSchema);
