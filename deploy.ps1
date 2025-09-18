# Voice Translator Pro - PowerShell Deployment Script
# سكريبت النشر لمترجم الصوت الذكي باستخدام PowerShell

Write-Host "🚀 بدء عملية النشر..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if git is available
try {
    $gitVersion = git --version
    Write-Status "Git version: $gitVersion"
} catch {
    Write-Error "Git is not installed or not in PATH"
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not in a git repository"
    exit 1
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Warning "There are uncommitted changes"
    $commitChanges = Read-Host "Do you want to commit them? (y/n)"
    if ($commitChanges -eq "y" -or $commitChanges -eq "Y") {
        git add .
        git commit -m "Auto-commit before deployment"
        Write-Success "Changes committed"
    } else {
        Write-Warning "Proceeding with uncommitted changes"
    }
}

# Get current branch
$currentBranch = git branch --show-current
Write-Status "Current branch: $currentBranch"

# Check if we're on main/master branch
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Warning "Not on main/master branch. Current branch: $currentBranch"
    $continueDeploy = Read-Host "Do you want to continue? (y/n)"
    if ($continueDeploy -ne "y" -and $continueDeploy -ne "Y") {
        Write-Error "Deployment cancelled"
        exit 1
    }
}

# Run tests if Node.js is available
if (Test-Path "test-local.js") {
    try {
        $nodeVersion = node --version
        Write-Status "Running tests..."
        node test-local.js
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests passed"
        } else {
            Write-Warning "Some tests failed, but continuing with deployment"
        }
    } catch {
        Write-Warning "Node.js not available, skipping tests"
    }
} else {
    Write-Warning "No test file found, skipping tests"
}

# Check for required files
Write-Status "Checking required files..."
$requiredFiles = @("index.html", "manifest.json", "sw.js", "styles.css", "script.js")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "✓ $file exists"
    } else {
        Write-Error "✗ $file is missing"
        exit 1
    }
}

# Create .nojekyll file if it doesn't exist
if (-not (Test-Path ".nojekyll")) {
    Write-Status "Creating .nojekyll file..."
    New-Item -ItemType File -Name ".nojekyll" -Force | Out-Null
    Write-Success ".nojekyll file created"
}

# Push to remote
Write-Status "Pushing to remote repository..."
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Success "Successfully pushed to remote"
} else {
    Write-Error "Failed to push to remote"
    exit 1
}

# Get repository URL
$repoUrl = git config --get remote.origin.url
if ($repoUrl -like "*github.com*") {
    # Extract username and repository name
    if ($repoUrl -like "*git@github.com:*") {
        $repoPath = $repoUrl -replace "git@github.com:", ""
    } elseif ($repoUrl -like "*https://github.com/*") {
        $repoPath = $repoUrl -replace "https://github.com/", ""
    }
    
    $repoPath = $repoPath -replace "\.git$", ""
    $githubPagesUrl = "https://$repoPath.github.io"
    
    Write-Success "Deployment completed!"
    Write-Status "Your app should be available at: $githubPagesUrl"
    Write-Status "GitHub Pages may take a few minutes to update"
    
    # Open in browser
    Start-Process $githubPagesUrl
} else {
    Write-Success "Deployment completed!"
    Write-Status "Repository URL: $repoUrl"
}

Write-Status "Deployment script finished"
Read-Host "Press Enter to continue"