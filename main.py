from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import AnalysisRequest, AnalysisResponse, DockerfileResponse, ChatRequest, ChatResponse, OptimizationResponse, FileNode
from docker_client import docker_manager
from analyzer import ai_analyzer as gemini_analyzer

app = FastAPI(
    title="AI Docker Image Analyzer API",
    description="Analyze Docker images using AI to generate hardening recommendations.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. In production, specify the frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(request: AnalysisRequest):
    try:
        # 1. Fetch metadata from Docker
        metadata = docker_manager.get_image_metadata(request.image_name)
        
        # 2. Analyze using Gemini
        recommendations = await gemini_analyzer.analyze_image(metadata)
        
        return AnalysisResponse(
            image=request.image_name,
            metadata=metadata,
            recommendations=recommendations
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-dockerfile", response_model=DockerfileResponse)
async def generate_dockerfile(request: AnalysisRequest):
    try:
        # Reuse existing metadata logic
        metadata = docker_manager.get_image_metadata(request.image_name)
        
        dockerfile_content = await gemini_analyzer.generate_dockerfile(metadata)
        
        return DockerfileResponse(dockerfile=dockerfile_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Reuse existing metadata logic
        metadata = docker_manager.get_image_metadata(request.image_name)
        
        response_text = await gemini_analyzer.chat_about_image(metadata, request.message)
        
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_image(request: AnalysisRequest):
    try:
        # Reuse existing metadata logic
        metadata = docker_manager.get_image_metadata(request.image_name)
        
        optimization_data = await gemini_analyzer.get_optimization_suggestions(metadata)
        
        if "error" in optimization_data:
             raise HTTPException(status_code=500, detail=optimization_data["error"])
             
        return OptimizationResponse(**optimization_data)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/files", response_model=List[FileNode])
async def get_files(request: AnalysisRequest):
    try:
        files = docker_manager.get_image_files(request.image_name)
        return files
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
