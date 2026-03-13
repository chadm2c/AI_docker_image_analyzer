# AI Docker Image Analyzer

A powerful tool to analyze Docker images for security vulnerabilities and generate hardening recommendations using AI (GitHub Models).

## Features
- **Security Analysis**: Identify potential risks in image metadata and history.
- **Dockerfile Reconstruction**: AI-powered generation of optimized Dockerfiles.
- **Interactive Chat**: Chat with an AI assistant about your Docker images.
- **Optimization Suggestions**: Get actionable advice to reduce image size.
- **File Explorer**: Browse the internal file system of your Docker images.

## Prerequisites
- Docker and Docker Compose installed.
- A **GitHub Personal Access Token** (classic or fine-grained) with access to GitHub Models.

## Quick Start (Using Pre-built Images)

1. **Create a `.env` file** in your project directory:
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```

2. **Run with Docker Compose**:
   Create a `docker-compose.yml` file:
   ```yaml
   services:
     backend:
       image: chadmany20/ai-docker-analyzer-backend:latest
       environment:
         - GITHUB_TOKEN=${GITHUB_TOKEN}
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
       networks:
         - guardian-network
       restart: unless-stopped

     frontend:
       image: chadmany20/ai-docker-analyzer-frontend:latest
       ports:
         - "80:80"
       depends_on:
         - backend
       networks:
         - guardian-network
       restart: unless-stopped

   networks:
     guardian-network:
       driver: bridge
   ```

3. **Start the application**:
   ```bash
   docker-compose up -d
   ```

4. **Access the Dashboard**:
   Open [http://localhost](http://localhost) in your browser.

## How the AI Works
The application leverages **GitHub Models** to provide its intelligence. By providing a `GITHUB_TOKEN`, the backend can connect to the GitHub AI inference endpoint. The token is used strictly for authentication with the AI model and remains secure within your environment.

