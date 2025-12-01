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
  const [signupRole, setSignupRole] = useState("student");

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    // setErrorMessage(""); 

    if (activeTab === "signup") {
      if (data.password !== data.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
          const res = await fetch("http://localhost:8000/api/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  username: data.username, 
                  email: data.email, 
                  password: data.password, 
                  role: signupRole 
              }),
          });

          const result = await res.json();
          if (res.ok) {
              alert("Registration successful! Please log in.");
          } else {
              alert(result.detail || "Registration failed.");
          }
      } catch (error) {
          alert("Failed to connect to the server for signup.");
      }

    } else {
        
      try {
          const res = await fetch("http://localhost:8000/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  email: data.email, 
                  password: data.password 
              }),
          });

          const user = await res.json();
          
          if (!res.ok) {
              alert(user.detail || "Invalid credentials. Please register first.");
              return;
          }
          
          const userRole = user.role;
          
          if (activeTab === "teacher") {
              if (userRole === "teacher") {
                  localStorage.setItem('teacherEmail', user.email);
                  navigate("/teacher-dashboard");
              } else {
                  alert("You are not registered as a teacher.");
              }
          } else if (activeTab === "student") {
              // teachers can log in on the student screen
              if (userRole === "student" || userRole === "teacher") { 
                  localStorage.setItem('studentEmail', user.email);
                  navigate("/student-dashboard");
              } else {
                  alert("You are not authorized for student login.");
              }
          }

      } catch (error) {
          alert("Failed to connect to the server for login.");
      }
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
            <>
              <div className="flex justify-center gap-4 my-4 p-2 bg-gray-100 rounded-lg shadow-inner">
                <span className="font-semibold text-sm self-center text-gray-700">Register As:</span>
                <div className="flex bg-white rounded-full p-1 shadow">
                  <button
                    type="button"
                    onClick={() => setSignupRole("student")}
                    className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                      signupRole === "student"
                        ? "bg-[#496677] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole("teacher")}
                    className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                      signupRole === "teacher"
                        ? "bg-[#496677] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>
              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
                className="p-3 mb-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#F0EAD8]"
              />
            </>
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
