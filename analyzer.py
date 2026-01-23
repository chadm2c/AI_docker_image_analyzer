import os
from openai import OpenAI
from dotenv import load_dotenv
from models import DockerMetadata

load_dotenv()

class DeepSeekAnalyzer:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.endpoint = "https://models.inference.ai.azure.com"
        self.model_name = "DeepSeek-V3-0324"
        
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
            return f"Error calling DeepSeek-V3 via GitHub Models: {str(e)}"

    def _format_history(self, history: list) -> str:
        summary = ""
        for i, layer in enumerate(history[:10]):
            created_by = layer.get('CreatedBy', '')
            size = layer.get('Size', 0)
            summary += f"- Layer {i}: {created_by[:100]}... (Size: {size})\n"
        return summary

deepseek_analyzer = DeepSeekAnalyzer()
