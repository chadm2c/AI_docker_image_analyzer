import docker
import tarfile
import io
from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from models import DockerMetadata, FileNode

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
        except docker.errors.ImageNotFound:
            raise HTTPException(status_code=404, detail=f"Image name '{image_name}' not found locally or on Docker Hub.")
        except docker.errors.APIError as e:
            if e.response.status_code == 404:
                 raise HTTPException(status_code=404, detail=f"Image name '{image_name}' not found locally or on Docker Hub.")
            raise Exception(f"Docker API Error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to extract metadata for {image_name}: {str(e)}")

    def get_image_files(self, image_name: str, max_depth: int = 5) -> List[FileNode]:
        if not self.client:
            raise Exception("Docker client not initialized")

        container = None
        try:
            # Create a temporary container to export its filesystem
            container = self.client.containers.create(image_name)
            strm, stat = container.get_archive("/")
            
            file_obj = io.BytesIO()
            for chunk in strm:
                file_obj.write(chunk)
            file_obj.seek(0)

            tree = {}

            with tarfile.open(fileobj=file_obj, mode='r') as tar:
                for member in tar.getmembers():
                    path_parts = member.name.strip("./").split("/")
                    if not path_parts or path_parts == ['']:
                        continue
                    
                    if len(path_parts) > max_depth:
                        continue

                    current_level = tree
                    for i, part in enumerate(path_parts):
                        if part not in current_level:
                            is_dir = member.isdir() if i == len(path_parts) - 1 else True
                            current_level[part] = {
                                "name": part,
                                "type": "directory" if is_dir else "file",
                                "size": member.size if i == len(path_parts) - 1 else 0,
                                "children": {}
                            }
                        current_level = current_level[part]["children"]

            def dict_to_nodes(d):
                nodes = []
                for key, value in d.items():
                    node = FileNode(
                        name=value["name"],
                        type=value["type"],
                        size=value["size"],
                        children=dict_to_nodes(value["children"]) if value["children"] else None
                    )
                    nodes.append(node)
                return sorted(nodes, key=lambda x: (x.type != 'directory', x.name))

            return dict_to_nodes(tree)

        except Exception as e:
            raise Exception(f"Failed to extract files for {image_name}: {str(e)}")
        finally:
            if container:
                try:
                    container.remove()
                except:
                    pass

docker_manager = DockerManager()
