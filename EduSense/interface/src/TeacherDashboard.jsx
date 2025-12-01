import React, { useState, useEffect } from "react";
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

  const [mode, setMode] = useState("assignment");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [dueDate, setDueDate] = useState("");


  useEffect(() => {
    fetch("http://localhost:8000/api/courses/")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched courses:", data);
        setCourses(data)
      })
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    fetch(`http://localhost:8000/api/assignments/?course_id=${selectedCourse}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched assignments for course", selectedCourse, ":", data);
        setAssignments(data)
      })
      .catch((err) => console.error("Error fetching assignments:", err));
  }, [selectedCourse]);

  const createAssignment = () => {
    if (!selectedCourse || !assignmentTitle.trim()) {
      alert("Please select a course and enter a title.");
      return;
    }

    fetch("http://localhost:8000/api/assignments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: assignmentTitle,
        course: selectedCourse,
        due_date: dueDate || null,
        settings: null
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Created assignment:", data);
        // optionally re-fetch assignments
        setAssignments([...assignments, data]);
        setAssignmentTitle(""); // Clear form
        alert("Assignment created!");
      })
      .catch((err) => console.error("Error creating assignment:", err));
  };



  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-[#496677]/80 to-[#F0EAD8]">
      <div className="w-[600px] bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Assignment</h1>
          <button className="text-gray-500 hover:text-gray-700">⚙️</button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("assignment")}
            className="px-4 py-2 rounded-lg bg-[#F0EAD8] font-semibold hover:bg-[#e5ddc7]"
          >
            Assignment Mode
          </button>

          <button
            onClick={() => setMode("course")}
            className="px-4 py-2 rounded-lg bg-[#496677]/20 font-semibold hover:bg-[#496677]/30"
          >
            Course Mode
          </button>
        </div>

        {/* Select Course */}
        {mode === "assignment" && (
          <>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Select Course</label>
              <select className="w-full border rounded-md px-3 py-2"
                value={selectedCourse}
                onChange={(e) => {
                  const courseId = e.target.value;
                  console.log("Selected course ID:", courseId);
                  setSelectedCourse(e.target.value)
                }}
              >
                <option value="">Choose a course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>{course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Assignment */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Select Assignment</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter assignment title"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
              />

              <div className="mb-4">
                <label className="block font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>


            </div>

            <ul className="mt-4 text-sm">
              {assignments.map(a => (
                <li key={a.assignment_id}>• {a.title}</li>
              ))}
            </ul>


            {/*
        
        <div className="mb-4">
          <p className="font-semibold mb-2">Assignment Type</p>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <label><input type="radio" name="type" /> Multiple Choice</label>
            <label><input type="radio" name="type" /> Short Answer</label>
            <label><input type="radio" name="type" /> Essay</label>
            <label><input type="radio" name="type" /> Project</label>
          </div>
        </div>
        */}

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
            <button
              onClick={createAssignment}
              className="w-full bg-[#F0EAD8]/80 text-[#4a3f35] font-semibold py-2 rounded-lg shadow-md hover:bg-[#F0EAD8]/90">
              Create Assignment
            </button>
          </>
        )}
        {mode === "course" && (
          <div className="text-center text-gray-700">
            <h2 className="text-xl font-semibold mb-4">Course Creation Coming Soon</h2>
            <p className="text-sm">Mode switching works</p>
          </div>
        )}
      </div>
    </div>
  );
}
