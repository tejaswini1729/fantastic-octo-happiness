@echo off
echo === Image Marker Project Git Setup ===
echo.

cd /d C:\ImageMarkerProject
echo Current directory: %CD%

echo.
echo === Initializing Git Repository ===
git init

echo.
echo === Adding files to Git ===
git add ImageMarkerApp.jsx
git add package.json  
git add README.md
git add .gitignore
git add GIT_PUSH_INSTRUCTIONS.md

echo.
echo === Checking Git Status ===
git status

echo.
echo === Committing files ===
git commit -m "Add Image Point Marker React App with Material-UI and dropdown"

echo.
echo === Repository is ready! ===
echo Now you need to add your remote repository URL and push:
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
echo git push -u origin main
echo.
echo Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual GitHub details

pause