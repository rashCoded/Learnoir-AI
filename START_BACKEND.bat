@echo off
echo Starting Learnoir AI Backend...
cd backend

REM Check if venv exists and is valid
if not exist "venv\Scripts\python.exe" (
    echo Virtual environment not found or corrupted. Creating new one...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
