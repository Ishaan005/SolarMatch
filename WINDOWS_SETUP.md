# Windows Setup & Troubleshooting Guide

## Prerequisites
- **Python 3.9+** installed
- **Node.js 18+** installed
- **Git** installed

## Initial Setup

### 1. Clone and Setup Environment Variables

```bash
# Clone the repository (if not already done)
git clone https://github.com/Ishaan005/SolarMatch.git
cd SolarMatch

# Create environment file for frontend
copy .env.local.example .env.local
# Edit .env.local with your API keys
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows Command Prompt:
venv\Scripts\activate.bat
# On Windows PowerShell:
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
pip install "httpx[http2]"

# Create .env file for backend
copy .env.example .env
# Edit .env with your Google Solar API key

# Start backend
python -m uvicorn main:app --reload --port 8000
```

**Backend should now be running at http://localhost:8000**
Test it by visiting http://localhost:8000/docs in your browser

### 3. Frontend Setup

```bash
# Open a NEW terminal window
cd SolarMatch

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Frontend should now be running at http://localhost:3000**

---

## Common Windows Issues & Fixes

### Issue 1: Port 8000 Already in Use

**Error:** `Address already in use` or `Port 8000 is already allocated`

**Fix:**
```bash
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID from above)
taskkill /PID <PID> /F

# OR use a different port
python -m uvicorn main:app --reload --port 8001
```

If using a different port, update `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
```

### Issue 2: Python Not Found

**Error:** `'python' is not recognized as an internal or external command`

**Fix:**
```bash
# Try using 'py' instead (Windows Python launcher)
py --version
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload --port 8000

# OR add Python to PATH:
# 1. Search "Environment Variables" in Windows
# 2. Edit "Path" under System Variables
# 3. Add Python installation directory (e.g., C:\Users\YourName\AppData\Local\Programs\Python\Python39\)
```

### Issue 3: Permission Denied / Execution Policy Error (PowerShell)

**Error:** `cannot be loaded because running scripts is disabled`

**Fix:**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate venv again:
venv\Scripts\Activate.ps1
```

### Issue 4: Windows Firewall Blocking Connections

**Error:** Frontend can't connect to backend (network errors)

**Fix:**
1. Go to Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Click "Change settings"
4. Find Python in the list and check both Private and Public
5. If not listed, click "Allow another app" and add Python.exe

**Alternative:** Use `127.0.0.1` instead of `localhost`
Update `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

### Issue 5: 400 Bad Request Error

**Cause:** Outdated code with invalid `view="FULL"` parameter

**Fix:**
```bash
# Make sure you have the latest code
git pull origin main

# Restart backend (the code fix is already there)
# Stop backend (Ctrl+C)
python -m uvicorn main:app --reload --port 8000

# Clear browser cache and refresh
```

### Issue 6: CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Fix:** Backend already has CORS enabled, but if you still see errors:
1. Make sure backend is running
2. Check that URLs match (localhost vs 127.0.0.1)
3. Try accessing http://localhost:8000/docs to verify backend is accessible

### Issue 7: Node Modules / Package Issues

**Error:** Module not found or dependency errors

**Fix:**
```bash
# Delete node_modules and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install

# If still issues, clear npm cache
npm cache clean --force
npm install
```

### Issue 8: Backend Dependencies Fail to Install

**Error:** Failed building wheel for rasterio or numpy

**Fix:**
```bash
# Install Microsoft C++ Build Tools from:
# https://visualstudio.microsoft.com/visual-cpp-build-tools/

# OR use pre-built wheels:
pip install --only-binary :all: rasterio numpy

# OR use conda (recommended for Windows):
# Download from https://docs.conda.io/en/latest/miniconda.html
conda create -n solarmatch python=3.9
conda activate solarmatch
conda install -c conda-forge rasterio numpy
pip install -r requirements.txt
```

---

## Verification Checklist

✅ Python 3.9+ installed: `python --version`  
✅ Node.js 18+ installed: `node --version`  
✅ Backend running: Visit http://localhost:8000/docs  
✅ Frontend running: Visit http://localhost:3000  
✅ Can enter address and get results  

---

## Still Having Issues?

1. **Check backend terminal** for error messages
2. **Check browser console** (F12) for frontend errors
3. **Verify API keys** are set correctly in `.env` files
4. **Test backend directly** by visiting http://localhost:8000/docs and trying the endpoints
5. **Check Python packages**: `pip list` should show all packages from requirements.txt

## Get Help

Share the following when asking for help:
- Backend terminal output (any errors)
- Browser console errors (F12 → Console tab)
- Your Python version: `python --version`
- Your Node version: `node --version`
- Operating system version: `winver` in Run dialog
