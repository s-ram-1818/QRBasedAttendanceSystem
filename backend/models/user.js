const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    username: { type: String, required: true, unique: true },

    rollNo: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      unique: function () {
        return this.role === "student";
      },
    },

    phone: { type: String, required: true, unique: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

// 🧠 Ensure MongoDB enforces uniqueness on rollNo only for students
userSchema.index(
  { rollNo: 1 },
  { unique: true, partialFilterExpression: { role: "student" } }
);

module.exports = mongoose.model("User", userSchema);
