# Justfile for Voice Translator Pro
# مترجم الصوت الذكي - Justfile

# Default recipe
default:
    @just --list

# Install dependencies
install:
    npm install

# Build the application
build:
    npm run build

# Run tests
test:
    npm test

# Run linter
lint:
    npm run lint

# Format code
format:
    npm run format

# Clean build artifacts
clean:
    rm -rf dist/ build/ node_modules/ coverage/

# Start development server
dev:
    npm run dev

# Start production server
prod:
    npm start

# Deploy to production
deploy:
    ./deploy.sh

# Build Docker image
docker:
    docker build -t voice-translator-pro .

# Start with Docker Compose
docker-compose:
    docker-compose up -d

# Deploy to Kubernetes
k8s:
    kubectl apply -f kubernetes.yaml

# Deploy with Terraform
terraform:
    terraform init
    terraform plan
    terraform apply

# Deploy with Ansible
ansible:
    ansible-playbook -i inventory ansible.yml

# Development setup
dev-setup: install
    @echo "Development environment setup complete!"

# Production setup
prod-setup: install build
    @echo "Production environment setup complete!"

# Full deployment
full-deploy: clean install build test docker docker-compose
    @echo "Full deployment complete!"

# Quick start
quick-start: install dev
    @echo "Quick start complete! Application running at http://localhost:3000"
