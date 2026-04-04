def calculate_weekly_premium(zone: str, vehicle_type: str, weekly_income: float):
    zone = zone.lower()
    vehicle_type = vehicle_type.lower()

    base_premium = 19
    risk_score = 0

    high_risk_zones = ["flood zone", "waterlogging zone", "heat zone", "high risk"]
    medium_risk_zones = ["urban zone", "mixed zone", "moderate risk"]

    if zone in high_risk_zones:
        risk_score += 20
    elif zone in medium_risk_zones:
        risk_score += 10

    if vehicle_type == "bike":
        risk_score += 5
    elif vehicle_type == "scooter":
        risk_score += 3
    else:
        risk_score += 1

    if weekly_income > 8000:
        risk_score += 5
    elif weekly_income > 5000:
        risk_score += 3

    premium = base_premium + risk_score

    if premium <= 25:
        plan = "Basic"
        payout = 250
        premium = 19
    elif premium <= 35:
        plan = "Smart"
        payout = 400
        premium = 29
    else:
        plan = "Shield"
        payout = 600
        premium = 49

    return {
        "weekly_premium": premium,
        "suggested_plan": plan,
        "daily_payout": payout,
        "risk_score": risk_score
    }
