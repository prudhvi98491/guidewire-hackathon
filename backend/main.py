from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_models.risk_pricing import calculate_weekly_premium, RiskProfileRequest
from services.parametric_trigger import evaluate_parametric_trigger, TriggerCheckRequest
from services.fraud_detection import detect_fraud, ClaimValidationRequest

app = FastAPI(title="GigGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to GigGuard API"}

@app.post("/api/risk/calculate-premium")
def get_premium(request: RiskProfileRequest):
    return calculate_weekly_premium(request)

@app.post("/api/trigger/evaluate")
def evaluate_trigger(request: TriggerCheckRequest):
    return evaluate_parametric_trigger(request)
    
@app.post("/api/fraud/validate")
def validate_claim(request: ClaimValidationRequest):
    return detect_fraud(request)
