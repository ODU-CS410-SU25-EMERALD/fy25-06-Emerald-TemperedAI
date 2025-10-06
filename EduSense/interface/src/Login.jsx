import React, { useState } from "react";
import { useForm } from "react-hook-form";
import logo from "./assets/EDUSENSE.svg";
import { useNavigate } from "react-router-dom";

/**
 * 
 * Providing the main login and sign up interface
 * 
 * Features as of now:
 * - Tab switching for Student, Teacher, and Sign Up
 * - Using React Hook form to manage form input and validation
 * - Handles navigation to dashboards based on user type (using react-router)
 * - Includes a "Forgot Password" link that goes to a placeholder page
 * 
 * Notes for future: 
 * - Form validation is basic, authentication integration still needs to be added
 * - Sign Up currently redirects to Student Dashboard for demo purposes
 * - Styling and layout may be adjusted based on feedback
 * - integration with backend API for login/signup
 */
 

export default function Login() {
  const [activeTab, setActiveTab] = useState("student");
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    if (activeTab === "student") {
      navigate("/student-dashboard");
    } else if (activeTab === "teacher") {
      navigate("/teacher-dashboard");
    } else if (activeTab === "signup") {
      // Basic validation: check if passwords match
      if (data.password !== data.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      console.log("Signup data:", data); 
      navigate("/student-dashboard"); 
    }
    reset();
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center">
      {/* Background color*/}
      <div className="absolute inset-0 bg-gradient-to-r from-[#496677]/80 to-[#F0EAD8] z-0"></div>

      {/* Card */}
      <div className="w-96 bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl z-10 overflow-hidden">
        {/* Logo */}
        <div className="flex justify-center py-6">
          <img src={logo} alt="EduSense Logo" className="w-100" />
        </div>

        {/* Tabs */}
        <div className="flex px-6 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("student")}
            type="button"
            className={`flex-1 py-2 font-semibold rounded-full transition-all ${
              activeTab === "student"
                ? "bg-[#F0EAD8]/80 text-[#4a3f35] shadow-md hover:bg-[#F0EAD8]/90"
                : "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab("teacher")}
            type="button"
            className={`flex-1 py-2 font-semibold rounded-full transition-all ${
              activeTab === "teacher"
                ? "bg-[#F0EAD8]/80 text-[#4a3f35] shadow-md hover:bg-[#F0EAD8]/90"
                : "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100"
            }`}
          >
            Teacher
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            type="button"
            className={`flex-1 py-2 font-semibold rounded-full transition-all ${
              activeTab === "signup"
                ? "bg-[#F0EAD8]/80 text-[#4a3f35] shadow-md hover:bg-[#F0EAD8]/90"
                : "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col px-6 pb-6" onSubmit={handleSubmit(onSubmit)}>
          {activeTab === "signup" && (
            <>
              <input
                type="text"
                placeholder="Username"
                {...register("username", { required: "Username is required" })}
                className="p-3 mb-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#F0EAD8]"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="p-3 mb-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#F0EAD8]"
          />

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className="p-3 mb-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#F0EAD8]"
          />

          {activeTab === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
              })}
              className="p-3 mb-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#F0EAD8]"
            />
          )}

          <button
            type="submit"
            className="w-full p-3 mt-2 rounded-full font-semibold text-[#4a3f35] bg-[#F0EAD8]/80 shadow-md hover:bg-[#F0EAD8]/90 transition-all"
          >
            {activeTab === "signup" ? "Create Account" : "Continue"}
          </button>
        </form>

        {/* Forgot password link only for login */}
        {activeTab !== "signup" && (
          <div className="mb-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-[#4a3f35] hover:underline"
            >
              Forgot your password?
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
