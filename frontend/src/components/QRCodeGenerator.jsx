import { useState } from "react";
import axios from "../api";

const QRCodeImageFetcher = () => {
  const [subject, setSubject] = useState("");
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQRCode = async () => {
    if (!subject) return alert("Enter subject name");
    setLoading(true);
    try {
      const res = await axios.get(`/generate-qr?subject=${subject}`);
      setQrUrl(res.data.qr); // assuming backend returns { qr: "image_url_or_base64" }
    } catch (err) {
      alert("Failed to fetch QR: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Get Subject QR Code
      </h2>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Enter subject name"
        className="border px-4 py-2 rounded w-full max-w-sm focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={fetchQRCode}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Get QR Code"}
      </button>

      {qrUrl && (
        <img
          src={qrUrl}
          alt="QR Code"
          className="mt-4 w-48 h-48 border border-gray-300"
        />
      )}
    </div>
  );
};

export default QRCodeImageFetcher;
