#!/bin/bash

# Voice Translator Pro - Deployment Script
# سكريبت النشر لمترجم الصوت الذكي

echo "🚀 بدء عملية النشر..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed or not in PATH"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "There are uncommitted changes"
    read -p "Do you want to commit them? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Auto-commit before deployment"
        print_success "Changes committed"
    else
        print_warning "Proceeding with uncommitted changes"
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if we're on main/master branch
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "Not on main/master branch. Current branch: $CURRENT_BRANCH"
    read -p "Do you want to continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

# Run tests
print_status "Running tests..."
if [ -f "test-local.js" ]; then
    if command -v node &> /dev/null; then
        node test-local.js
        if [ $? -eq 0 ]; then
            print_success "Tests passed"
        else
            print_warning "Some tests failed, but continuing with deployment"
        fi
    else
        print_warning "Node.js not available, skipping tests"
    fi
else
    print_warning "No test file found, skipping tests"
fi

# Check for required files
print_status "Checking required files..."
REQUIRED_FILES=("index.html" "manifest.json" "sw.js" "styles.css" "script.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file is missing"
        exit 1
    fi
done

# Create .nojekyll file if it doesn't exist
if [ ! -f ".nojekyll" ]; then
    print_status "Creating .nojekyll file..."
    touch .nojekyll
    print_success ".nojekyll file created"
fi

# Push to remote
print_status "Pushing to remote repository..."
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    print_success "Successfully pushed to remote"
else
    print_error "Failed to push to remote"
    exit 1
fi

# Get repository URL
REPO_URL=$(git config --get remote.origin.url)
if [[ $REPO_URL == *"github.com"* ]]; then
    # Extract username and repository name
    if [[ $REPO_URL == *"git@github.com:"* ]]; then
        REPO_PATH=${REPO_URL#git@github.com:}
    elif [[ $REPO_URL == *"https://github.com/"* ]]; then
        REPO_PATH=${REPO_URL#https://github.com/}
    fi
    
    REPO_PATH=${REPO_PATH%.git}
    GITHUB_PAGES_URL="https://${REPO_PATH}.github.io"
    
    print_success "Deployment completed!"
    print_status "Your app should be available at: $GITHUB_PAGES_URL"
    print_status "GitHub Pages may take a few minutes to update"
    
    # Open in browser if possible
    if command -v xdg-open &> /dev/null; then
        xdg-open "$GITHUB_PAGES_URL"
    elif command -v open &> /dev/null; then
        open "$GITHUB_PAGES_URL"
    elif command -v start &> /dev/null; then
        start "$GITHUB_PAGES_URL"
    fi
else
    print_success "Deployment completed!"
    print_status "Repository URL: $REPO_URL"
fi

print_status "Deployment script finished"
