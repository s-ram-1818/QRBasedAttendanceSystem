import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import QRCodeGenerator from "./components/QRCodeGenerator";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
// import CreateCourse from "./components/CreateCourse"; // I
// f you create this
import Home from "./components/Home"; // Optional homepage
import ScanPage from "./components/Scan";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/generate-qr" element={<QRCodeGenerator />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* <Route path="/create-course" element={<CreateCourse />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
