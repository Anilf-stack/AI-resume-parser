import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState(""); 
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Please enter your email.");
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleUpload = async () => {
    if (!file || !email || emailError) {
      alert("Please provide a valid email and select a file!");
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("email", email);
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        setTimeout(() => navigate(`/jobs?email=${email}`), 2000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage("Failed to upload resume.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Upload Your Resume</h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-2">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateEmail(email)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-2">Upload Resume</label>
          <label className="w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-blue-400 transition duration-300">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setFileName(e.target.files[0]?.name || "");
              }}
            />
            <span className="text-gray-500">{fileName || "Click to select a file"}</span>
          </label>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {/* Message Display */}
        {message && <p className="mt-4 text-center text-sm font-medium">{message}</p>}
      </div>
    </div>
  );
}
