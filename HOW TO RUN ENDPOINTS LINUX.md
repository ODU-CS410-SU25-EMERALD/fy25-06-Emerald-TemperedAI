**How to run**

- ***DEPENDENCIES***
- python3
- pip
- python3.12-venv

--install the following within the virtual environment via pip (pip install ...):
- Django
- django-cors-headers
- requests
- markitdown
- -r requirements.txt



- *** START PYTHON SERVER ***
CREATE VIRTUAL ENVIRONMENT:     python3 -m venv MyPythonVirtualEnvironment
START VIRTUAL ENVIVRONMENT:     source MyPythonVirtualEnvironment/bin/activate
FROM EduSense folder:           python manage.py runserver
OR FROM ROOT OF PROJECT:        python EduSense\manage.py runserver
CLOSE VIRTUAL ENVIRONMENT (WHEN DONE):  deactivate

***Response should be something similar to below, then server booted correctly and is ready to go:***
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
*Date - Time*
Django version 5.2.7, using settings 'EduSense.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.

WARNING: This is a development server. Do not use it in a production setting. Use a production WSGI or ASGI server instead.
For more information on production servers see: https://docs.djangoproject.com/en/5.2/howto/deployment/



- *** Ensure Ollama is running (icon in task bar) ***
IF NOT RUN:                                       ollama run edusense:latest
FOR EXAMPLE, FOR lama3.1:8b-instruct-q5_K_M RUN:  ollama run llama3.1:8b-instruct-q5_K_M



- *** SEND PROMPT TO DJANGO (general prompt) *** --> **ADDING 'Answer only' TO PROMPT SIGNIFICANTLY SPEEDS UP RESPONSE**
curl -X POST http://127.0.0.1:8000/api/ollama/generate/  -H "Content-Type: application/json" -d "{\"prompt\": \"YOUR PROMPT HERE.\", \"model\": \"llama3.1:8b-instruct-q5_K_M\"}"  

- *** EXAMPLE: ***
curl -X POST http://127.0.0.1:8000/api/ollama/generate/  -H "Content-Type: application/json" -d "{\"prompt\": \"What is 2+2?\", \"model\": \"llama3.1:8b-instruct-q5_K_M\"}"

curl -X POST http://127.0.0.1:8000/api/tutor/ollama/generate/  -H "Content-Type: application/json" -d "{\"prompt\": \"What is the space and time complexity of a ten times nested for loop in C++? Answer only.\", \"model\": \"llama3.1:8b-instruct-q5_K_M\"}"    

*** Only receive response back from the LLM *** (might need to remove tutor part of URL below)
Use this when you only want to see the prompt returned instead of the full JSON

(Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/tutor/ollama/generate/" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body '{"prompt": "What is 2+2", "model": "edusense:latest"}').Content | ConvertFrom-Json | Select-Object -ExpandProperty response


- ***Response could be***
{"model":"llama3.1:8b-instruct-q5_K_M","created_at":"*DATE&TIME*","response":"4","done":true,"done_reason":"stop","context":[*VARIOUS INTEGERS*],"total_duration":823654600,"load_duration":151879400,"prompt_eval_count":20,"prompt_eval_duration":417835900,"eval_count":2,"eval_duration":252900300}

{"model":"llama3.1:8b-instruct-q5_K_M","created_at":"*DATE&TIME*","response":"**Time Complexity:**\nO(n^10)\n\n**Space Complexity:**\nO(1) (assuming no auxiliary arrays or structures are used)","done":true,"done_reason":"stop","context":[*VARIOUS INTEGERS*],"total_duration":13299357400,"load_duration":263947500,"prompt_eval_count":30,"prompt_eval_duration":3841994900,"eval_count":30,"eval_duration":9192073800}



