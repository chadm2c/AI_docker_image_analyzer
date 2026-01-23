import docker
from typing import Dict, Any, List
from models import DockerMetadata

class DockerManager:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            print(f"Error connecting to Docker: {e}")
            self.client = None

    def get_image_metadata(self, image_name: str) -> DockerMetadata:
        if not self.client:
            raise Exception("Docker client not initialized")

        try:
            # Ensure the image is present
            try:
                self.client.images.get(image_name)
            except docker.errors.ImageNotFound:
                print(f"Image {image_name} not found, pulling...")
                self.client.images.pull(image_name)

            image = self.client.images.get(image_name)
            inspect_data = image.attrs
            history_data = image.history()

            # Extract useful metadata
            config = inspect_data.get('Config', {})
            
            metadata = DockerMetadata(
                image_id=inspect_data.get('Id', ''),
                author=inspect_data.get('Author', ''),
                os=inspect_data.get('Os', ''),
                architecture=inspect_data.get('Architecture', ''),
                size=inspect_data.get('Size', 0),
                user=config.get('User', ''),
                exposed_ports=list(config.get('ExposedPorts', {}).keys()) if config.get('ExposedPorts') else [],
                env_vars=config.get('Env', []),
                history=history_data
            )
            return metadata
        except Exception as e:
            raise Exception(f"Failed to extract metadata for {image_name}: {str(e)}")

docker_manager = DockerManager()
