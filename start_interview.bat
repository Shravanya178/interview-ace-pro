@echo off
echo Starting Mock Interview System...

:: Get the directory where the batch file is located
cd /d "%~dp0"

:: Check if Python is installed
python --version > nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Run the application
echo Running Mock Interview System...
python app.py

:: If there's an error, pause to show the message
if errorlevel 1 (
    echo.
    echo An error occurred while running the application.
    pause
) 