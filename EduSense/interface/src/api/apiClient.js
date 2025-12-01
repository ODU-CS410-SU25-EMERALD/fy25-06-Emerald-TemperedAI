import axios from "axios";

/**
 * API client for making requests to the EduSense backend.
 */
const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000/api/tutor/",
    timeout: 300000, //Same as Ollama timeout
    headers:{
        "Content-Type":"application/json",
    },
});

export default apiClient;
