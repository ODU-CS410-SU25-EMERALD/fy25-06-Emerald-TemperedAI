/**
 * Purpose: Provides the main dashboard interface for students.
 * 
 * Features:
 * - Course and Assignment selectors (static for now)
 * - Simple chat box (no backend functionality until merge)
 * - Chat history sidebar (placeholder for now)
 * - Logout button to return to login screen
 * 
 * Notes for future: 
 * - Course and assignment data will eventually come from the backend
 * - Chat box function will connect to the LLM API after integration
 * - Authentication integration still needs to be added
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // Display a welcome message on load
  useEffect(() => {
    setChat([
      {
        sender: "ai",
        text: "Welcome back to EduSense. Select a course and assignment to get started.",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  async function sendPromptToBackend(prompt, file) {
    try {
      const formData = new FormData();
      formData.append("prompt", prompt);

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("http://localhost:8000/api/ollama/generate/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.response ||
        data.message ||
        data.output ||
        data.text ||
        data?.choices?.[0]?.message?.content ||
        "No response from AI."
      );
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  // For now, this only updates the chat visually — no backend call yet
  const sendPrompt = async () => {
    if (!userInput.trim()) return;

    const studentMsg = {
      sender: "student",
      text: userInput,
      time: new Date().toLocaleTimeString(),
    };

    setChat((prevChat) => [...prevChat, studentMsg]);

    const promptToSend = `Course: ${selectedCourse}\nAssignment: ${selectedAssignment}\nQuestion: ${userInput}`;

    const aiText = await sendPromptToBackend(promptToSend, selectedFile);

    const aiMsg = {
      sender: "ai",
      text: aiText,
      time: new Date().toLocaleTimeString(),
    };
    setChat((prevChat) => [...prevChat, aiMsg]);
    setUserInput("");
    setSelectedFile(null);
  };

  const startNewChat = () => {
    setChat([
    {
      sender: "ai",
      text: "Starting a new conversation. How can I help?",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  setUserInput("");
  setSelectedFile(null);
};

  const handleLogout = () => {
    setChat([]);
    navigate("/");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-[#496677]/80 to-[#F0EAD8]">
      <div className="flex w-11/12 h-5/6 rounded-2xl shadow-xl overflow-hidden bg-white/70 backdrop-blur-md">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">EduSense</h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm"
            >
              Logout
            </button>
          </div>

          <button
            onClick={startNewChat}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
          >
            + New Chat
          </button>

          <h3 className="font-semibold mb-2">Chat History</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="border rounded px-2 py-1 hover:bg-gray-100 cursor-pointer">
              History 1
            </li>
            <li className="border rounded px-2 py-1 hover:bg-gray-100 cursor-pointer">
              History 2
            </li>
            <li className="border rounded px-2 py-1 hover:bg-gray-100 cursor-pointer">
              History 3
            </li>
          </ul>
        </div>

        {/* Chat + Course/Assignment Area */}
        <div className="flex-1 flex flex-col">
          {/* Course & Assignment Selection */}
          <div className="p-4 border-b flex flex-col items-center gap-3">
            <div className="flex gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Select Course
                </label>
                <select
                  className="border rounded-md px-3 py-2"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Choose a course</option>
                  <option value="CS252 INTRO TO UNIX FOR PROGRAMMERS">
                    CS252 INTRO TO UNIX FOR PROGRAMMERS
                  </option>
                  <option value="CS381 INTRO TO DISCRETE STRUCTURES">
                    CS381 INTRO TO DISCRETE STRUCTURES
                  </option>
                  <option value="STAT330 INTRO-PROBABILITY & STAT">
                    STAT330 INTRO-PROBABILITY & STAT
                  </option>
                  <option value="CS463 CRYPTOGRAPHY FOR CYBERSECURITY">
                    CS463 CRYPTOGRAPHY FOR CYBERSECURITY
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Select Assignment
                </label>
                <select
                  className="border rounded-md px-3 py-2"
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                >
                  <option value="">Choose an assignment</option>
                  <option value="Prototype 1">Prototype 1</option>
                  <option value="CIQ Journal">CIQ Journal</option>
                  <option value="ADTs: Working with Classes">
                    ADTs: Working with Classes
                  </option>
                </select>
              </div>
            </div>

            {selectedCourse && selectedAssignment && (
              <p className="text-gray-600 text-sm mt-2">
                Great choice! Let’s get started on{" "}
                <span className="font-semibold">{selectedCourse}</span>,{" "}
                <span className="font-semibold">{selectedAssignment}</span>.
              </p>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {chat.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">
                Welcome back. Select a course and assignment to get started.
              </p>
            ) : (
              chat.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 ${msg.sender === "student" ? "text-right" : "text-left"
                    }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg shadow-sm ${msg.sender === "student"
                      ? "bg-blue-100 border border-blue-200"
                      : "bg-gray-100 border border-gray-200"
                      }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t flex gap-2 items-center">
            <input
              key={selectedFile ? selectedFile.name : "empty"}
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="border rounded-md p-2"
            />


            <input
              type="text"
              className="flex-1 border rounded-md px-3 py-2"
              placeholder="Ask a question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />

            <button
              onClick={sendPrompt}
              className="ml-2 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              ➤
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
