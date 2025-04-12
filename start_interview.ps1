Write-Host "Starting Mock Interview System..." -ForegroundColor Green

# Get the directory where the script is located
Set-Location $PSScriptRoot

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Using $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the application
Write-Host "Running Mock Interview System..." -ForegroundColor Green
try {
    python app.py
} catch {
    Write-Host "An error occurred while running the application." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
} 