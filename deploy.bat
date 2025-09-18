@echo off
REM Voice Translator Pro - Deployment Script for Windows
REM سكريبت النشر لمترجم الصوت الذكي على Windows

echo 🚀 بدء عملية النشر...

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed or not in PATH
    exit /b 1
)

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not in a git repository
    exit /b 1
)

REM Check for uncommitted changes
git status --porcelain | findstr /r "." >nul
if %errorlevel% equ 0 (
    echo ⚠️ There are uncommitted changes
    set /p commit_changes="Do you want to commit them? (y/n): "
    if /i "%commit_changes%"=="y" (
        git add .
        git commit -m "Auto-commit before deployment"
        echo ✅ Changes committed
    ) else (
        echo ⚠️ Proceeding with uncommitted changes
    )
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 📋 Current branch: %CURRENT_BRANCH%

REM Check if we're on main/master branch
if not "%CURRENT_BRANCH%"=="main" if not "%CURRENT_BRANCH%"=="master" (
    echo ⚠️ Not on main/master branch. Current branch: %CURRENT_BRANCH%
    set /p continue_deploy="Do you want to continue? (y/n): "
    if /i not "%continue_deploy%"=="y" (
        echo ❌ Deployment cancelled
        exit /b 1
    )
)

REM Run tests if Node.js is available
if exist "test-local.js" (
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo 🧪 Running tests...
        node test-local.js
        if %errorlevel% equ 0 (
            echo ✅ Tests passed
        ) else (
            echo ⚠️ Some tests failed, but continuing with deployment
        )
    ) else (
        echo ⚠️ Node.js not available, skipping tests
    )
) else (
    echo ⚠️ No test file found, skipping tests
)

REM Check for required files
echo 📁 Checking required files...
set REQUIRED_FILES=index.html manifest.json sw.js styles.css script.js
for %%f in (%REQUIRED_FILES%) do (
    if exist "%%f" (
        echo ✅ %%f exists
    ) else (
        echo ❌ %%f is missing
        exit /b 1
    )
)

REM Create .nojekyll file if it doesn't exist
if not exist ".nojekyll" (
    echo 📄 Creating .nojekyll file...
    echo. > .nojekyll
    echo ✅ .nojekyll file created
)

REM Push to remote
echo 📤 Pushing to remote repository...
git push origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo ✅ Successfully pushed to remote
) else (
    echo ❌ Failed to push to remote
    exit /b 1
)

REM Get repository URL
for /f "tokens=*" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i
echo %REPO_URL% | findstr "github.com" >nul
if %errorlevel% equ 0 (
    REM Extract username and repository name
    for /f "tokens=2 delims=/" %%a in ("%REPO_URL%") do set USERNAME=%%a
    for /f "tokens=3 delims=/" %%a in ("%REPO_URL%") do set REPO_NAME=%%a
    set REPO_NAME=%REPO_NAME:.git=%
    
    set GITHUB_PAGES_URL=https://%USERNAME%.github.io/%REPO_NAME%
    
    echo ✅ Deployment completed!
    echo 🌐 Your app should be available at: %GITHUB_PAGES_URL%
    echo ⏰ GitHub Pages may take a few minutes to update
    
    REM Open in browser
    start "" "%GITHUB_PAGES_URL%"
) else (
    echo ✅ Deployment completed!
    echo 🌐 Repository URL: %REPO_URL%
)

echo 📋 Deployment script finished
pause
