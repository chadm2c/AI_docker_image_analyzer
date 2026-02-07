import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from models import DockerMetadata

load_dotenv()

class AIAnalyzer:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.endpoint = "https://models.inference.ai.azure.com"
        self.model_name = "Llama-4-Scout-17B-16E-Instruct"
        
        if self.token:
            self.client = OpenAI(
                base_url=self.endpoint,
                api_key=self.token,
            )
        else:
            self.client = None

    async def analyze_image(self, metadata: DockerMetadata) -> str:
        if not self.client:
            return "GitHub Token not configured. Please set GITHUB_TOKEN in .env file."

        prompt = f"""
        Analyze the following Docker image metadata for security vulnerabilities and provide hardening recommendations.
        
        Image ID: {metadata.image_id}
        OS/Arch: {metadata.os}/{metadata.architecture}
        Size: {metadata.size} bytes
        User: {metadata.user if metadata.user else 'Not defined (defaults to root)'}
        Exposed Ports: {', '.join(metadata.exposed_ports) if metadata.exposed_ports else 'None'}
        Environment Variables: {', '.join(metadata.env_vars) if metadata.env_vars else 'None'}
        
        Docker History Summary:
        {self._format_history(metadata.history)}

        Please provide:
        1. Potential security risks (e.g., running as root, leaked secrets in env, unnecessary ports).
        2. Actionable hardening recommendations.
        3. A brief summary of the base image if identifiable.
        """

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cloud security expert specializing in Docker container hardening.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model_name,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error calling AI Model via GitHub Models: {str(e)}"

    async def generate_dockerfile(self, metadata: DockerMetadata) -> str:
        if not self.client:
            return "# GitHub Token not configured. Cannot generate Dockerfile."

        prompt = f"""
        Reconstruct the most likely original `Dockerfile` for the following container image based on its metadata and history.
        
        Metadata:
        - Image ID: {metadata.image_id}
        - Base OS/Arch: {metadata.os}/{metadata.architecture}
        - User: {metadata.user if metadata.user else 'root'}
        - Exposed Ports: {', '.join(metadata.exposed_ports) if metadata.exposed_ports else 'None'}
        - Env Vars: {', '.join(metadata.env_vars) if metadata.env_vars else 'None'}

        Image Layers (History):
        {self._format_history(metadata.history)}

        Instructions:
        1. Start with a likely FROM instruction (guess the base image, e.g., alpine, debian, node).
        2. Combine related RUN commands where logical, but respect the layer history.
        3. Include ENV, EXPOSE, and WORKDIR instructions derived from the metadata.
        4. End with the likely CMD or ENTRYPOINT.
        5. Output ONLY the raw Dockerfile content. No markdown formatting or explanation.
        """

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Docker expert. Output only valid Dockerfile code.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model_name,
            )
            content = response.choices[0].message.content
            # Strip markdown code blocks if the model includes them despite instructions
            if content.startswith("```"):
                content = content.replace("```dockerfile", "").replace("```", "").strip()
            return content
        except Exception as e:
            return f"# Error generating Dockerfile: {str(e)}"

    def _format_history(self, history: list) -> str:
        summary = ""
        for i, layer in enumerate(history[:10]):
            created_by = layer.get('CreatedBy', '')
            size = layer.get('Size', 0)
            summary += f"- Layer {i}: {created_by[:100]}... (Size: {size})\n"
        return summary

    async def chat_about_image(self, metadata: DockerMetadata, user_message: str) -> str:
        if not self.client:
            return "GitHub Token not configured. Please set GITHUB_TOKEN in .env file."

        context = f"""
        You are a helpful AI assistant analyzing a Docker image.
        
        Image Context:
        - Image ID: {metadata.image_id}
        - OS/Arch: {metadata.os}/{metadata.architecture}
        - Computed Size: {metadata.size} bytes
        - User: {metadata.user if metadata.user else 'Not defined (defaults to root)'}
        - Exposed Ports: {', '.join(metadata.exposed_ports) if metadata.exposed_ports else 'None'}
        - Env Vars: {', '.join(metadata.env_vars) if metadata.env_vars else 'None'}
        
        Image History (Layers):
        {self._format_history(metadata.history)}
        """

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": context,
                    },
                    {
                        "role": "user",
                        "content": user_message,
                    }
                ],
                model=self.model_name,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error calling AI Model: {str(e)}"

    async def get_optimization_suggestions(self, metadata: DockerMetadata) -> dict:
        if not self.client:
            return {"error": "GitHub Token not configured."}

        prompt = f"""
        Analyze the following Docker image for size optimization opportunities.
        
        Metadata:
        - Image ID: {metadata.image_id}
        - Total Size: {metadata.size} bytes
        - Current User: {metadata.user if metadata.user else 'root'}
        - Base OS: {metadata.os}
        
        History Layers:
        {self._format_history(metadata.history)}
        
        Task:
        Identify 3-5 specific ways to reduce the image size. Focus on:
        1. Base image alternatives (e.g., using alpine, slim, or distroless).
        2. Layer reduction (combining RUN commands).
        3. Removing build-time dependencies or caches.
        
        Output format: JSON only.
        {{
            "suggestions": [
                {{
                    "title": "Short title",
                    "description": "Detailed explanation of what to do and why.",
                    "potential_savings": "Estimated saving in MB or bytes"
                }}
            ],
            "total_size": {metadata.size},
            "potential_total_savings": "Total estimated savings"
        }}
        """

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Docker optimization expert. Return ONLY valid JSON matching the requested structure.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model_name,
                response_format={ "type": "json_object" }
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"error": f"Error during optimization analysis: {str(e)}"}

ai_analyzer = AIAnalyzer()
