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
      setMessage(res.data);
    } catch (err) {
      setMessage(err.response?.data || "Error");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        📚 Create New Course
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["teachername", "subject", "code"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            className="w-full p-2 border rounded-xl"
            required
          />
        ))}
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">
          Create
        </button>
        {message && <p className="text-center mt-2">{message}</p>}
      </form>
    </div>
  );
};

export default CourseForm;
