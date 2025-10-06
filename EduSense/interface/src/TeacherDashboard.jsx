import React from "react";
/**
 * Purpose: Provides the main dashboard interface for teachers.
 * 
 * Features(UI as of now 10/01/2025)
 * - Header section
 * - Course selector dropdown
 * - Assignment selector dropdown
 * - Assignment type (radio buttons; only one option can be selected at a time)
 * - Slider for AI assistance level
 * - File upload input
 * - Create Assignment button
 * 
 * Notes for future:
 * - No functionality has been added yet, this is just the UI layout
 * - Will connect to backend to create assignments, upload files, etc.
 * - Authentication integration still needs to be added
 * - Logout function needs to be added
 */
export default function TeacherDashboard() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-[#496677]/80 to-[#F0EAD8]">
      <div className="w-[600px] bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Assignment</h1>
          <button className="text-gray-500 hover:text-gray-700">⚙️</button>
        </div>

        {/* Select Course */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Course</label>
          <select className="w-full border rounded-md px-3 py-2">
            <option value="">Choose a course</option>
            <option value="CS252 INTRO TO UNIX FOR PROGRAMMERS">CS252 INTRO TO UNIX FOR PROGRAMMERS</option>
            <option value="CS 381 INTRO TO DISCRETE STRUCTURES">CS 381 INTRO TO DISCRETE STRUCTURES</option>
            <option value="STAT330 INTRO-PROBABILITY & STAT">STAT330 INTRO-PROBABILITY & STAT</option>
            <option value="CS463 CRYPTOGRAPHY FOR CYBERSECURITY">CS463 CRYPTOGRAPHY FOR CYBERSECURITY</option>
          </select>
        </div>

        {/* Select Assignment */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Assignment</label>
          <select className="w-full border rounded-md px-3 py-2">
            <option value="">Choose an assignment</option>
            <option value="Prototype 1">Prototype 1</option>
            <option value="CIQ journal">CIQ journal</option>
            <option value="ADTS: Working with Classes">Lab Report</option>
          </select>
        </div>

        {/* Options: (radio: one option at a time) */}
        <div className="mb-4">
          <p className="font-semibold mb-2">Assignment Type</p>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <label><input type="radio" name="type" /> Multiple Choice</label>
            <label><input type="radio" name="type" /> Short Answer</label>
            <label><input type="radio" name="type" /> Essay</label>
            <label><input type="radio" name="type" /> Project</label>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">AI Assistance</label>
          <input type="range" min="0" max="10" className="w-full" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">Upload Files</label>
          <input type="file" className="block text-sm text-gray-700" />
        </div>

        {/* Button */}
        <button className="w-full bg-[#F0EAD8]/80 text-[#4a3f35] font-semibold py-2 rounded-lg shadow-md hover:bg-[#F0EAD8]/90">
          Create Assignment
        </button>
      </div>
    </div>
  );
}
