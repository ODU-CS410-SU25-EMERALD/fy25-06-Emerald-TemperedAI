import apiClient from "./apiClient";

export async function createConversation({ course, assignment }) {
  const payload = {
    course,
    assignment,
    // later we can add student_id if your serializer supports it
  };

  const response = await apiClient.post("/conversation/", payload);
  return response.data; 
}
