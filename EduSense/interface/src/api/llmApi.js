import apiClient from "./apiClient";

/**
 * API for interacting with the LLM endpoints.
 * 
 * param:
 * - prompt: The prompt to send to the LLM.
 * - model: The model to use for the LLM.
 */

export async function sendLLMPrompt({
  prompt,
  model = "edusense:latest",
  conversationId,
  course,
  assignment,
}) {
  const payload = { prompt, model };

  if (conversationId) payload.conversation_id = conversationId;
  if (course) payload.course = course;
  if (assignment) payload.assignment = assignment;

  const response = await apiClient.post("/ollama/generate/", payload);
  return response.data;
}
