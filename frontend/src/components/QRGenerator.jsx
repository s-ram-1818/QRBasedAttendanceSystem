import React, { useState } from "react";
import axios from "../api";

const QRGenerator = () => {
  const [code, setCode] = useState("");
  const [qr, setQr] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError("⚠️ Course code is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/generate-qr?code=${code}`, {
        withCredentials: true,
      });
      setQr(res.data.qr);
    } catch (err) {
      setError(err.response?.data || "❌ Failed to generate QR");
      setQr(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md mx-auto w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-purple-700 mb-6">
        📸 Generate Attendance QR
      </h2>

      <div className="flex flex-col mb-4">
        <label
          htmlFor="code"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Course Code
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. MATH101"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full py-2 rounded-lg font-semibold transition ${
          loading
            ? "bg-purple-400 text-white cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        }`}
      >
        {loading ? "Generating..." : "Generate QR"}
      </button>

      {qr && (
        <div className="mt-6 text-center">
          <img
            src={qr}
            alt="QR Code"
            className="mx-auto border p-2 rounded-lg"
          />
          <p className="mt-3 text-green-600 font-medium">
            ✅ QR Code generated successfully!
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
      )}
    </div>
  );
};

export default QRGenerator;
