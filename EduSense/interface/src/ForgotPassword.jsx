import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setMessage("");

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter the email associated with your account.");
      return;
    }

    // Very basic email check 
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    // backend call

    setTimeout(() => {
      setIsSubmitting(false);
      setStatus("success");
      setMessage(
        `Reset link has been sent to ${email}.`
      );
    }, 700);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-[#496677]/80 to-[#F0EAD8]">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-xl px-8 py-10 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          We'll send you a link to reset your password once the backend is connected.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Student or Teacher?
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="instructor">Teacher</option>
            </select>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="____@odu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Status message */}
          {status && (
            <p
              className={`text-sm mt-1 ${
                status === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-gray-600 hover:underline"
            >
              Back to login
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#496677] text-white text-sm px-4 py-2 rounded-md hover:bg-[#3c5361] disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
