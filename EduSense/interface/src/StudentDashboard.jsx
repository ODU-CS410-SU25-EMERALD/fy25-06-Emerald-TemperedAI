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
  const [conversationId, setConversationId] = useState(null);
  const [conversationList, setConversationList] = useState([]);
  const navigate = useNavigate();
  const [fileLoading, setFileLoading] = useState(false);


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

  const assignmentFiles = {
    "Database Concepts HW 5": "/assignments/db_1.docx",
    "Database Concepts HW 1": "/assignments/db_2.docx",
    "Philosophy Module 3 HW": "/assignments/phil_1.docx",
    "Philosophy Module 11 HW": "/assignments/phil_2.docx",
    "Statistics Probability Handout 2": "/assignments/stat_1.pdf",
    "Statistics Estimating Proportions adn Variances Handout": "/assignments/stat_2.pdf",
  };

  const courseAssignments = {
    "CS450 DATABASE CONCEPTS": [
      "Database Concepts HW 5",
      "Database Concepts HW 1",
    ],
    "STAT330 INTRO-PROBABILITY & STAT": [
      "Statistics Probability Handout 2",
      "Statistics Estimating Proportions adn Variances Handout",
    ],
    "PHIL1000 INTRODUCTION TO PHILOSOPHY": [
      "Philosophy Module 3 HW",
      "Philosophy Module 11 HW",
    ],
  };

  const assignmentIds = {
    "Database Concepts HW 1": 1,
    "Database Concepts HW 5": 2,
    "Philosophy Module 3 HW": 3,
    "Philosophy Module 11 HW": 4,
    "Statistics Probability Handout 2": 5,
    "Statistics Estimating Proportions adn Variances Handout": 6,
  };

  const courseIds = {
    "CS450 DATABASE CONCEPTS": 1,
    "PHIL1000 INTRODUCTION TO PHILOSOPHY": 2,
    "STAT330 INTRO-PROBABILITY & STAT": 3,
  };

  const [assignmentFile, setAssignmentFiles] = useState(null);


  async function loadAssignmentFile(path) {
    const response = await fetch(path);
    const blob = await response.blob();
    const filename = path.split("/").pop();
    return new File([blob], filename);
  }

  async function sendPromptToBackend(promptText, file, conversationId, assignmentId) {
    console.log("DEBUG Sending Prompt:", promptText);

    try {
      const formData = new FormData();
      formData.append("prompt", String(promptText || "Student asked an empty question."));
      formData.append("conversation_id", String(conversationId));
      if (assignmentId !== null && assignmentId !== undefined) {
        formData.append("assignment_id", String(assignmentId));
      } else {
        formData.append("assignment_id", "");
      }

      if (file) {
        console.log("DEBUG selectedFile", file);
        formData.append("file", file);
      }

      console.log("WARNING Sending Prompt:", promptText);

      const response = await fetch("http://localhost:8000/api/ollama/generate/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = "EduSense could not process the request. Please try again.";
        try {
          const errJson = await response.json();
          if (errJson?.error) errMsg = errJson.error;
        } catch { }

        console.error("OLLAMA ERROR RESPONSE:", errMsg);

        return { error: errMsg };
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
    if (fileLoading) {
      alert("Please wait, assignment file is still loading...");
      return;
    }

    if (!userInput.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (!selectedCourse) {
      alert("Please select a course first.");
      return;
    }


    if (!userInput.trim()) return;

    // If starting a new chat, create conversation in backend
    let convId = conversationId;

    if (!convId) {
      const convResponse = await fetch("http://localhost:8000/api/conversations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          assignment: selectedAssignment ? assignmentIds[selectedAssignment] : null,
          student: 1,  // temp hardcoded student
        }),
      });

      const convData = await convResponse.json();
      console.log("CONVERSATION CREATE RESPONSE:", convData);

      if (!convResponse.ok) {
        alert("Conversation failed: " + JSON.stringify(convData));
        return;
      }

      // Your model uses conversation_id, NOT id
      convId = convData.conversation_id;

      // Save to React state (updates next render)
      setConversationId(convId);
    }


    const studentMsg = {
      sender: "student",
      text: userInput,
      time: new Date().toLocaleTimeString(),
    };

    setChat((prevChat) => [...prevChat, studentMsg]);

    await fetch('http://localhost:8000/api/questions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: userInput,
        answer: "",
        assignment: selectedAssignment ? assignmentIds[selectedAssignment] : null,
        conversation: convId,
      }),
    }
    )

    const updatedHistory = [...chat, studentMsg].slice(-12); // Limit to last 12 messages for context

    const historyText = updatedHistory
      .map((msg) => `${msg.sender === "student" ? "Student" : "AI"}: ${msg.text}`)
      .join("\n");

    const promptToSend = [
      `Course: ${selectedCourse}`,
      `Assignment: ${selectedAssignment || "None Selected"}`,
      ``,
      `Conversation History:`,
      historyText,
      ``,
      `Student's New Question:`,
      userInput
    ].join("\n");

    const fileToSend = selectedFile ? selectedFile : assignmentFile;
    const aiText = await sendPromptToBackend(
      promptToSend,
      fileToSend,
      convId,
      selectedAssignment ? assignmentIds[selectedAssignment] : null
    );

    if (aiText && aiText.error) {
      const errorMsg = {
        sender: "ai",
        text: aiText.error,
        time: new Date().toLocaleTimeString(),
      };

      setChat((prevChat) => [...prevChat, errorMsg]);
      setUserInput("");

      return;
    }


    const aiMsg = {
      sender: "ai",
      text: aiText,
      time: new Date().toLocaleTimeString(),
    };

    await fetch("http://localhost:8000/api/llm_responses/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptToSend,
        raw_response: aiText,
        final_response: aiText,
        time: new Date().toISOString(),
        conversation: convId
      }),
    });


    setChat((prevChat) => [...prevChat, aiMsg]);
    setUserInput("");
    //setSelectedFile(null);

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

  useEffect(() => {
    fetch("http://localhost:8000/api/conversations/")
      .then((response) => response.json())
      .then((data) => setConversationList(data))
      .catch((error) => console.error("Error fetching conversations:", error));
  }, []);

  const loadConversation = async (id) => {
    setConversationId(id);

    const data = await fetch(`http://localhost:8000/api/conversations/${id}/`)
      .then((res) => res.json());

    const loadedChat = [];

    data.questions.forEach((q) => {
      loadedChat.push({
        sender: "student",
        text: q.question_text,
        time: new Date(q.timestamp).toLocaleTimeString(),
        sortTime: q.timestamp,
      });
    });

    data.llm_responses.forEach((r) => {
      loadedChat.push({
        sender: "ai",
        text: r.final_response,
        time: new Date(r.timestamp).toLocaleTimeString(),
        sortTime: r.timestamp,
      });
    });

    loadedChat.sort((a, b) => new Date(a.sortTime) - new Date(b.sortTime));

    setChat(loadedChat);
  };

  async function deleteConversation(id) {
    if (!window.confirm("Delete this chat?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/conversations/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversationList(conversationList.filter(c => c.conversation_id !== id));
        setChat([{ sender: "ai", text: "Chat deleted.", time: new Date().toLocaleTimeString() }]);
        setConversationId(null);
      } else {
        alert("Failed to delete chat");
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  }


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
          <ul className="space-y-1 text-sm text-gray-700 overflow-y-auto max-h-[60vh] pr-1">
            {conversationList.length === 0 && (
              <li className="text-gray-500 text-sm">No conversations yet</li>
            )}

            {conversationList.map((conv) => (
              <li
                key={conv.conversation_id}
                className="border rounded px-2 py-1 hover:bg-gray-100 flex justify-between items-center"
              >
                <span
                  onClick={() => loadConversation(conv.conversation_id)}
                  className="flex-grow cursor-pointer"
                >
                  {conv.title || `Chat ${conv.conversation_id}`}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.conversation_id);
                  }}
                  className="ml-3 text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </li>

            ))}
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
                  <option value="CS450 DATABASE CONCEPTS">
                    CS450 DATABASE CONCEPTS
                  </option>
                  <option value="PHIL1000 INTRODUCTION TO PHILOSOPHY">
                    PHIL1000 INTRODUCTION TO PHILOSOPHY
                  </option>
                  <option value="STAT330 INTRO-PROBABILITY & STAT">
                    STAT330 INTRO-PROBABILITY & STAT
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
                  onChange={async (e) => {
                    const assignment = e.target.value;
                    setSelectedAssignment(assignment);
                    const filePath = assignmentFiles[assignment];

                    if (assignment && filePath) {
                      setFileLoading(true);
                      const file = await loadAssignmentFile(filePath);
                      setAssignmentFiles(file);
                      setFileLoading(false);
                    } else {
                      setAssignmentFiles(null); // clear old file
                    }
                  }}

                  disabled={!selectedCourse}
                >
                  <option value="">No assignment</option>
                  {selectedCourse &&
                    courseAssignments[selectedCourse]?.map((assignment) => (
                      <option key={assignment} value={assignment}>
                        {assignment}
                      </option>
                    ))}
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

          {assignmentFile && <span style={{ display: "none" }}>{assignmentFile.name}</span>}


          {/* Chat Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {chat.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">
                Welcome back. Select a course to get started.
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
              onKeyDown={(e) => {
                if (e.key === "Enter" ){
                  e.preventDefault();
                  sendPrompt();
                }

              }}
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
