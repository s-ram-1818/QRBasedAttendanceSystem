const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
      type: mongoose.Schema.Types.ObjectId, // Reference to User model
      ref: "User",
      // Do NOT use unique: true here!
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
