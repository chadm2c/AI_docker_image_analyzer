---
description: how to run the AI Docker Image Analyzer
---

To run the application, you need to start both the backend server and the frontend development server.

### 1. Prerequisites
Ensure you have Docker running on your system, as the backend interacts with the Docker daemon.

### 2. Start the Backend
Navigate to the root directory and run the following commands:

1. Install dependencies:
```powershell
pip install -r requirements.txt
```

2. Start the FastAPI server:
```powershell
python main.py
```
The backend will be available at `http://localhost:8000`.

### 3. Start the Frontend
Navigate to the `frontend` directory and run:

1. Install dependencies:
```powershell
npm install
```

2. Start the Vite development server:
```powershell
npm run dev
```
The frontend will be available at the URL shown in your terminal (usually `http://localhost:5173`).

---
> [!NOTE]
> Make sure your `.env` file in the root directory contains a valid `GITHUB_TOKEN` for the AI features to work.
