from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from app.services.ml_service import MLService

router = APIRouter()
ml_service = MLService()

class DomainPredictionRequest(BaseModel):
    cgpa: float
    interests: Dict[str, bool] # e.g. {'math': true, 'design': false}

class DomainPredictionResponse(BaseModel):
    predicted_domain: str

@router.post("/predict_domain", response_model=DomainPredictionResponse)
async def predict_domain(request: DomainPredictionRequest):
    try:
        domain = ml_service.predict_domain(request.cgpa, request.interests)
        return DomainPredictionResponse(predicted_domain=domain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
