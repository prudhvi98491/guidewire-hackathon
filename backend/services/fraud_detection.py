from pydantic import BaseModel

class ClaimValidationRequest(BaseModel):
    rider_id: str
    claim_location_lat: float
    claim_location_lng: float
    disruption_zone: str

# Mock active rider cache preventing duplicate claims
PROCESSED_CLAIMS_TODAY = set()

def detect_fraud(request: ClaimValidationRequest):
    # 1. Duplicate claim prevention
    claim_key = f"{request.rider_id}_{request.disruption_zone}"
    if claim_key in PROCESSED_CLAIMS_TODAY:
        return {"fraud_detected": True, "reason": "Claim already processed today."}
        
    # 2. Location anomaly mock (In real-world: Haversine distance from disruption zone)
    # If the rider's mockup location is perfectly 0,0, flag it
    if request.claim_location_lat == 0 and request.claim_location_lng == 0:
        return {"fraud_detected": True, "reason": "Anomaly: Invalid GPS coordinates."}
        
    # Simulation: 5% chance of random anomaly for demo
    import random
    if random.random() < 0.05:
        return {"fraud_detected": True, "reason": "Anomaly: Rider was offline during the disruption event."}
        
    # If it passes
    PROCESSED_CLAIMS_TODAY.add(claim_key)
    return {"fraud_detected": False, "score": 0.02, "reason": "Valid"}
