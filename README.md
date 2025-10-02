# Team Emerald- Fall 2025

## Members

 - Cshgill012 - Hannah Gill - hgill012@odu.edu
 - cdona005 - Cody Donahue - cdona005@odu.edu
 - ZemYG21 - Zemi Gebreyohannes - zgebr001@odu.edu
 - coola101 - Alex Gignac - agign001@odu.edu
 - klevvergirl - Dillon Sapp - dsapp001@odu.edu
 - BriaTheCreator - Brianna Thomas - bthom083@odu.edu
 - cbieh001 - Christian Biehn - cbieh001@odu.edu





**How to run**

- *** START PYTHON SERVER ***
python manage.py runserver

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



- *** SEND PROMPT TO DJANGO (general prompt) *** --> **ADDING 'Answer only' TO PROMPT SIGNIFICANTLY SPEEDS UP RESPONSE**
curl -X POST http://127.0.0.1:8000/api/tutor/ollama/generate/ ^
     -H "Content-Type: application/json" ^
     -d "{\"prompt\": \"YOUR PROMPT HERE.\", \"model\": \"llama3.1:8b-instruct-q5_K_M\"}"  

- *** EXAMPLE: ***
 curl -X POST http://127.0.0.1:8000/api/tutor/ollama/generate/ ^
     -H "Content-Type: application/json" ^
     -d "{\"prompt\": \"What is 2+2, answer only.\", \"model\": \"llama3.1:8b-instruct-q5_K_M\"}"

curl -X POST http://127.0.0.1:8000/api/tutor/ollama/generate/ ^
     -H "Content-Type: application/json" ^
     -d "{\"prompt\": \"What is the space and time complexity of a ten times nested for loop in C++. Answer only.\", \"model\": \"llama3.1:8b-instruct-q5_K_M\"}"       

- ***Response could be***
{"model":"llama3.1:8b-instruct-q5_K_M","created_at":"*DATE&TIME*","response":"4","done":true,"done_reason":"stop","context":[*VARIOUS INTEGERS*],"total_duration":823654600,"load_duration":151879400,"prompt_eval_count":20,"prompt_eval_duration":417835900,"eval_count":2,"eval_duration":252900300}

{"model":"llama3.1:8b-instruct-q5_K_M","created_at":"*DATE&TIME*","response":"**Time Complexity:**\nO(n^10)\n\n**Space Complexity:**\nO(1) (assuming no auxiliary arrays or structures are used)","done":true,"done_reason":"stop","context":[*VARIOUS INTEGERS*],"total_duration":13299357400,"load_duration":263947500,"prompt_eval_count":30,"prompt_eval_duration":3841994900,"eval_count":30,"eval_duration":9192073800}



