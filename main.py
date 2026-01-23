from fastapi import FastAPI, HTTPException
from models import AnalysisRequest, AnalysisResponse
from docker_client import docker_manager
from analyzer import deepseek_analyzer as gemini_analyzer

app = FastAPI(
    title="AI Docker Image Analyzer API",
    description="Analyze Docker images using AI to generate hardening recommendations.",
    version="1.0.0"
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
