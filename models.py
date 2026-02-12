from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class ChatRequest(BaseModel):
    image_name: str
    message: str

class ChatResponse(BaseModel):
    response: str

class FileContentRequest(BaseModel):
    image_name: str
    file_path: str

class FileContentResponse(BaseModel):
    content: str
    is_binary: bool = False

class OptimizationSuggestion(BaseModel):
    title: str
    description: str
    potential_savings: str  # e.g. "45 MB" or "10%"

class OptimizationResponse(BaseModel):
    suggestions: List[OptimizationSuggestion]
    total_size: int
    potential_total_savings: str

class FileNode(BaseModel):
    name: str
    type: str  # 'file' or 'directory'
    size: int = 0
    children: Optional[List['FileNode']] = None

FileNode.model_rebuild()

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

class DockerfileResponse(BaseModel):
    dockerfile: str
