import React, { useState } from "react";
import axios from "../api";

const CourseForm = () => {
  const [form, setForm] = useState({ teachername: "", subject: "", code: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/create-course", form, {
        withCredentials: true,
      });
      setMessage(`✅ ${res.data}`);
      setForm({ teachername: "", subject: "", code: "" }); // Reset form
    } catch (err) {
      setMessage(`❌ ${err.response?.data || "Error creating course"}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-800">
        📚 Create New Course
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm text-gray-600">
            Teacher Name
          </label>
          <input
            name="teachername"
            value={form.teachername}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-600">Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-600">
            Course Code
          </label>
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Create Course
        </button>

        {message && (
          <p
            className={`text-center text-sm font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default CourseForm;
