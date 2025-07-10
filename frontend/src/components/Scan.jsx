import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const ScanPage = () => {
  const readerRef = useRef(null);
  const scannerRef = useRef(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!readerRef.current) {
        setMessage("❌ QR container not found.");
        return;
      }

      scannerRef.current = new Html5Qrcode(readerRef.current.id);

      Html5Qrcode.getCameras()
        .then((devices) => {
          if (!devices.length) {
            setMessage("❌ No camera found.");
            return;
          }

          return scannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            async (decodedText) => {
              if (!decodedText) return;
              await scannerRef.current.stop();

              try {
                const url = new URL(decodedText);
                const token = url.searchParams.get("token");

                if (!token) {
                  setMessage("⚠️ Invalid QR code.");
                  return;
                }

                const res = await axios.get(`/mark-attendance?token=${token}`, {
                  withCredentials: true,
                });

                setMessage(`✅ ${res.data}`);
                setTimeout(() => navigate("/dashboard"), 2000);
              } catch (err) {
                setMessage(err.response?.data || "❌ Error marking attendance");
              }
            }
          );
        })
        .catch((err) => {
          console.error("Camera error", err);
          setMessage("❌ Unable to access camera.");
        });
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-indigo-800 mb-2">
          📷 Scan QR Code
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Position the QR code within the frame
        </p>

        <div
          id="qr-reader"
          ref={readerRef}
          className="w-full h-[300px] rounded-lg border-2 border-indigo-400 shadow-inner"
        ></div>

        {message && (
          <p
            className={`mt-4 text-sm font-semibold ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("⚠️")
                ? "text-yellow-500"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm shadow transition"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ScanPage;
