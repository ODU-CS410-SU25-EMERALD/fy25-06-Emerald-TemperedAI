import requests

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "edusense"

def query_ollama(prompt: str, system: str = None) -> str:
    """ Send a prompt to the local Ollama API and reurn the model's response"""
    payload = {
       "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
    }

    if system:
        payload["system"] = system

    try:
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()
    except requests.exceptions.RequestException as e:
        print(f"ollama request failed: {e}")
        return "LLM unavailable, try again later"
    