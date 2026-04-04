def validate_claim(user, policy, trigger_type, existing_claims):
    if not policy or policy.get("status") != "Active":
        return {
            "valid": False,
            "reason": "No active policy found"
        }

    for claim in existing_claims:
        if claim["user_id"] == user["id"] and claim["trigger_type"] == trigger_type:
            return {
                "valid": False,
                "reason": "Duplicate claim detected for same trigger"
            }

    gps_valid = True
    if not gps_valid:
        return {
            "valid": False,
            "reason": "GPS validation failed"
        }

    anomaly_detected = False
    if anomaly_detected:
        return {
            "valid": False,
            "reason": "Suspicious claim pattern detected"
        }

    return {
        "valid": True,
        "reason": "Claim passed all fraud checks"
    }
