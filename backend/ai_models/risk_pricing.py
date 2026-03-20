import random
from pydantic import BaseModel
from typing import Dict, Any

# Mock historical data features:
# [past_disruptions, avg_daily_earnings, vehicle_type_risk_factor, zone_risk_factor]
# Target: estimated weekly risk probability (0.0 to 1.0)

# We will use a simple heuristic simulating an AI model for the hackathon
class RiskProfileRequest(BaseModel):
    rider_id: str
    zone: str
    vehicle_type: str # e.g., "Bike", "Cycle", "EV"
    avg_daily_earnings: float

def calculate_weekly_premium(request: RiskProfileRequest) -> Dict[str, Any]:
    # Simulate an AI model predicting risk based on input factors
    base_premium = 20.0 # Base premium in INR
    
    # Zone risk factors (Mock AI inference)
    zone_risks = {
        "Koramangala": 1.2,
        "Indiranagar": 1.1,
        "Whitefield": 1.5, # High risk due to waterlogging
        "HSR Layout": 1.3
    }
    
    zone_multiplier = zone_risks.get(request.zone, 1.0)
    
    # Vehicle risk factors
    vehicle_risks = {
        "Bike": 1.0,
        "EV": 1.1, # EV batteries more susceptible to water damage/halts
        "Cycle": 1.4 # Cycles are highly affected by extreme rain/heat
    }
    
    vehicle_multiplier = vehicle_risks.get(request.vehicle_type, 1.0)
    
    # Earnings multiplier: Higher earnings = higher coverage = slightly higher premium
    earnings_multiplier = 1.0 + ((request.avg_daily_earnings - 500) / 5000)
    
    # Add random jitter to simulate complex ML output changing over time
    ml_confidence_score = round(random.uniform(0.85, 0.98), 2)
    
    # Final premium calculation
    final_premium = base_premium * zone_multiplier * vehicle_multiplier * earnings_multiplier
    
    # Suggested payout (Parametric coverage)
    # E.g., If they pay 30/week, they get 500/day if trigger hits.
    suggested_daily_payout = request.avg_daily_earnings * 0.8 # 80% income protection
    
    return {
        "rider_id": request.rider_id,
        "weekly_premium_inr": round(final_premium, 2),
        "suggested_daily_payout_inr": round(suggested_daily_payout, 2),
        "risk_level": "High" if final_premium > 30 else "Moderate",
        "ai_confidence": ml_confidence_score
    }
