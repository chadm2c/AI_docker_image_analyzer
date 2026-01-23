from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalysisRequest(BaseModel):
    image_name: str = Field(..., example="nginx:latest")

class LayerInfo(BaseModel):
    id: str
    created_by: str
    size: int

class DockerMetadata(BaseModel):
    image_id: str
    author: Optional[str] = None
    os: str
    architecture: str
    size: int
    user: Optional[str] = None
    exposed_ports: Optional[List[str]] = None
    env_vars: Optional[List[str]] = None
    history: List[Dict[str, Any]]

class AnalysisResponse(BaseModel):
    image: str
    metadata: DockerMetadata
    recommendations: str
