import random
import time
from typing import Optional
from pydantic import BaseModel

# Mocked external API for Weather Events
def get_mock_weather_data(zone: str):
    # Depending on the hackathon demo, we could make this dynamic.
    # We will randomize extreme weather for demo purposes if it's "Whitefield"
    if zone == "Whitefield":
        return {"rain_mm_hr": random.choice([0, 5, 20, 50]), "temp_c": 30}
    elif zone == "Delhi_NCR":
        return {"rain_mm_hr": 0, "temp_c": random.choice([38, 42, 45, 48])} # Extreme heat
    else:
        return {"rain_mm_hr": 0, "temp_c": 28} # Normal

class TriggerCheckRequest(BaseModel):
    policy_id: str
    rider_id: str
    zone: str
    daily_payout_inr: float
    custom_rain_mm_hr: Optional[float] = None
    custom_temp_c: Optional[float] = None

def evaluate_parametric_trigger(request: TriggerCheckRequest):
    if request.custom_rain_mm_hr is not None or request.custom_temp_c is not None:
        weather = {
            "rain_mm_hr": request.custom_rain_mm_hr if request.custom_rain_mm_hr is not None else 0.0,
            "temp_c": request.custom_temp_c if request.custom_temp_c is not None else 28.0
        }
    else:
        weather = get_mock_weather_data(request.zone)
    
    # Thresholds
    rain_threshold = 15 # mm/hr
    heat_threshold = 42 # Celsius
    
    triggered = False
    disruption_reason = None
    
    if weather["rain_mm_hr"] >= rain_threshold:
        triggered = True
        disruption_reason = f"Extreme Rainfall ({weather['rain_mm_hr']} mm/hr)"
    elif weather["temp_c"] >= heat_threshold:
        triggered = True
        disruption_reason = f"Extreme Heatwave ({weather['temp_c']} °C)"
        
    if triggered:
        return {
            "status": "TRIGGERED",
            "policy_id": request.policy_id,
            "rider_id": request.rider_id,
            "payout_amount": request.daily_payout_inr,
            "reason": disruption_reason,
            "timestamp": time.time()
        }
    else:
        return {
            "status": "NO_DISRUPTION",
            "reason": "Weather conditions are normal.",
            "weather_data": weather
        }
