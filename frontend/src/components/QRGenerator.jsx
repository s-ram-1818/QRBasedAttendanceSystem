import React, { useEffect, useState } from "react";
import axios from "../api";

const QRGenerator = () => {
  const [code, setcode] = useState("");
  const [qr, setQr] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    try {
      const res = await axios.get(`/generate-qr?code=${code}`, {
        withCredentials: true,
      });
      setQr(res.data.qr);
      setError("");
    } catch (err) {
      setError(err.response?.data || "Failed to generate QR");
      setQr(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        📸 Generate Attendance QR
      </h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setcode(e.target.value)}
        placeholder="Enter code"
        className="w-full p-2 mb-4 border rounded-xl"
      />
      <button
        onClick={handleGenerate}
        className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700"
      >
        Generate QR
      </button>
      {qr && (
        <div className="mt-4 text-center">
          <img src={qr} alt="QR Code" className="mx-auto" />
          <p className="mt-2 text-green-600 font-semibold">
            QR code generated!
          </p>
        </div>
      )}
      {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
};

export default QRGenerator;
