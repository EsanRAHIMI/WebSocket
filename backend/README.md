# fastapi uvicorn

## Backend Setup

Backend execution steps:
cd /Users/ehsanrahimi/Works/WebSocket/backend

python3 -m venv venv
source venv/bin/activate

Install required packages:
pip install fastapi uvicorn
pip install "uvicorn[standard]" websockets

Run the server:
uvicorn main:app --reload
If your main file has a different name (e.g., app.py):
uvicorn app.main:app --reload
Change port to 8001:
uvicorn main:app --reload --port 8001
If you want it to always run on port 8001 by default,
change the end of the code in main.py (or whatever file runs the server) to this:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

Create and automatically update requirements.txt 
Create or update → pip freeze > requirements.txt
Install from it → pip install -r requirements.txt

List packages:
pip list

✅ Now every time just write:
source venv/bin/activate
python main.py
