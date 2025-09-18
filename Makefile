# Makefile for Voice Translator Pro
# مترجم الصوت الذكي - Makefile

.PHONY: help install build test lint format clean dev prod deploy docker docker-compose k8s terraform ansible

# Default target
help:
	@echo "Voice Translator Pro - Available Commands:"
	@echo "  install      - Install dependencies"
	@echo "  build        - Build the application"
	@echo "  test         - Run tests"
	@echo "  lint         - Run linter"
	@echo "  format       - Format code"
	@echo "  clean        - Clean build artifacts"
	@echo "  dev          - Start development server"
	@echo "  prod         - Start production server"
	@echo "  deploy       - Deploy to production"
	@echo "  docker       - Build Docker image"
	@echo "  docker-compose - Start with Docker Compose"
	@echo "  k8s          - Deploy to Kubernetes"
	@echo "  terraform    - Deploy with Terraform"
	@echo "  ansible      - Deploy with Ansible"

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
	rm -rf dist/
	rm -rf build/
	rm -rf node_modules/
	rm -rf coverage/

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
