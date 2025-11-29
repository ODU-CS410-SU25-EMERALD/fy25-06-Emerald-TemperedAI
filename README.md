# Team Emerald- Fall 2025

## Members
 
 - Cshgill012 - Hannah Gill - hgill012@odu.edu
 - cdona005 - Cody Donahue - cdona005@odu.edu
 - ZemYG21 - Zemi Gebreyohannes - zgebr001@odu.edu
 - coola101 - Alex Gignac - agign001@odu.edu
 - klevvergirl - Dillon Sapp - dsapp001@odu.edu
 - BriaTheCreator - Brianna Thomas - bthom083@odu.edu
 - cbieh001 - Christian Biehn - cbieh001@odu.edu

 ## Instructions for Running Production Server

   ## First Time Set Up ##
   1. Note: These commands are written assuming the reader is using Windows Powershell and has scoop package manager installed
   2. Open a command terminal
   3. Run:
          python -m venv .venv
          Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
          .\.venv\Scripts\Activate.ps1
   4. Note: venv should be active
   5. Note: If system dependencies change, the next step will need to be reperformed with the updated requirements.txt
   6. Run:
          pip install -r requirements.txt
          scoop install caddy cloudflared (if not already installed)
          cloudflared login (to authenticate and select your domain)
          cloudflared tunnel create my-tunnel (where "my-tunnel" is an arbitrary name)
   7. Copy the credentials path
   8. Create a cloudflared config.yml and include the credentials path
   ## Activating Production Server
   9. Open two more terminals
   10. On the terminal still in venv (navigate to the folder containing the interface subfolder), run:
           uvicorn EduSense.asgi:application --host localhost --port 8000
   11. On the second terminal, navigate to the project folder containing the Caddyfile and run:
           caddy run --config Caddyfile
   12. On the third terminal, run:
           cloudflared tunnel run my-tunnel