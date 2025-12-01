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
  const [selectedFile, setSelectedFile] = useState(null);
  const [llmModel, setLlmModel] = useState("edusense_testing:latest");


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

    const formData = new FormData();
    formData.append("title", assignmentTitle);
    formData.append("course", selectedCourse);
    formData.append("settings", "");
    formData.append("llm_model", llmModel);
    formData.append("due_date", dueDate);
    formData.append("teacher_id", 1); // Hardcoded for now
    if (selectedFile) formData.append("file", selectedFile);

    fetch("http://localhost:8000/api/assignments/", {
      method: "POST",
      body: formData,
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
            className={`px-4 py-2 rounded-lg font-semibold ${mode === "assignment"
                ? "bg-[#F0EAD8] hover:bg-[#e5ddc7]"
                : "bg-[#496677]/20 hover:bg-[#496677]/30"
              }`}
          >
            Assignment Mode
          </button>

          <button
            onClick={() => setMode("course")}
            className={`px-4 py-2 rounded-lg font-semibold ${mode === "course"
                ? "bg-[#F0EAD8] hover:bg-[#e5ddc7]"
                : "bg-[#496677]/20 hover:bg-[#496677]/30"
              }`}
          >
            Course Mode
          </button>

          <button
            onClick={() => setMode("analytics")}
            className={`px-4 py-2 rounded-lg font-semibold ${mode === "analytics"
                ? "bg-[#F0EAD8] hover:bg-[#e5ddc7]"
                : "bg-[#496677]/20 hover:bg-[#496677]/30"
              }`}
          >
            Analytics
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
                  onChange={(e) => {
                    const formatted = e.target.value;
                    setDueDate(formatted);
                    
                  }}
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

            <div className="mb-4">
              <label className="block font-semibold mb-1">LLM Model</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
              >
                <option value="edusense_testing:latest">EduSense Default</option>
                <option value="edusense:latest">Strict</option>
                <option value="edusense_testing:latest">Helpful</option>
              </select>
            </div>

            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="block text-sm text-gray-700"
            />


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
        {mode === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Course Performance Overview</h2>

            <div className="grid grid-cols-2 gap-4">

              {/* Assignment Completion */}
              <div className="bg-white/90 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Assignment Completion</p>
                <h3 className="text-4xl font-extrabold text-[#496677]">84%</h3>
                <div className="h-2 bg-[#F0EAD8] rounded-full mt-2">
                  <div className="w-[84%] h-2 bg-[#496677] rounded-full"></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Avg Score: 72%</p>
              </div>

              {/* Question Performance */}
              <div className="bg-white/90 p-4 rounded-lg shadow">
                <p className="text-sm font-semibold mb-2">Question Performance</p>
                <div className="flex justify-between items-end h-16">
                  <div className="w-4 bg-[#496677]/60 h-[80%] rounded-t-sm"></div>
                  <div className="w-4 bg-[#496677]/60 h-[50%] rounded-t-sm"></div>
                  <div className="w-4 bg-[#496677]/60 h-[95%] rounded-t-sm"></div>
                  <div className="w-4 bg-[#496677]/60 h-[70%] rounded-t-sm"></div>
                  <div className="w-4 bg-[#496677]/60 h-[30%] rounded-t-sm"></div>
                </div>
              </div>
            </div>

            {/* Student Progress */}
            <div className="bg-white/90 p-4 rounded-lg shadow">
              <p className="font-semibold mb-3">Student Progress</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="w-1/5">Ann</span>
                  <div className="w-4/5 h-2 bg-[#F0EAD8] rounded-full">
                    <div className="w-[90%] h-2 bg-[#496677] rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-1/5">Bob</span>
                  <div className="w-4/5 h-2 bg-[#F0EAD8] rounded-full">
                    <div className="w-[65%] h-2 bg-[#496677] rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-1/5">Lara</span>
                  <div className="w-4/5 h-2 bg-[#F0EAD8] rounded-full">
                    <div className="w-[80%] h-2 bg-[#496677] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Mastery */}
            <div className="bg-white/90 p-4 rounded-lg shadow">
              <p className="font-semibold mb-2">Class Mastery by Topic</p>
              <div className="grid grid-cols-5 gap-1 h-10">
                <div className="bg-[#496677]/10"></div>
                <div className="bg-[#496677]/30"></div>
                <div className="bg-[#496677]/50"></div>
                <div className="bg-[#496677]/70"></div>
                <div className="bg-[#496677]"></div>
              </div>
              <a href="#" className="text-xs text-[#496677] hover:text-[#496677]/80 mt-2 block text-right">View detailed reports &gt;</a>
            </div>

          </div>
        )}


      </div>
    </div>
  );
}
