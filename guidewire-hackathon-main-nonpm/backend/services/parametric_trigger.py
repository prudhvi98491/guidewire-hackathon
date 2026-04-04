def evaluate_trigger(trigger_type: str, value: float):
    trigger_type = trigger_type.lower()

    if trigger_type == "rain":
        return {
            "triggered": value > 15,
            "message": "Heavy Rain / Flood Trigger Evaluated",
            "threshold": "Rainfall > 15 mm/hr"
        }

    elif trigger_type == "heat_stress":
        # Simulate Heat Index / Wet Bulb calculation: value here is Heat Index in Celsius
        # At high humidity, 35C is as dangerous as 45C in dry heat.
        return {
            "triggered": value > 38,
            "message": "Scientific Heat-Humid Stress Trigger breached (HHI/Wet-Bulb Equivalent)",
            "threshold": "HI > 38°C (Critical for Safe Outdoor Physical Work)"
        }

    elif trigger_type == "aqi":
        return {
            "triggered": value > 300,
            "message": "AQI / Pollution Trigger Evaluated",
            "threshold": "AQI > 300"
        }

    elif trigger_type == "platform_shutdown":
        return {
            "triggered": value == 1,
            "message": "Platform / Zone Shutdown Trigger Evaluated",
            "threshold": "Platform outage or zone shutdown"
        }

    elif trigger_type == "internet_outage":
        return {
            "triggered": value == 1,
            "message": "Regional Internet Outage Detected",
            "threshold": "Network disruption in delivery zone"
        }

    elif trigger_type == "curfew":
        return {
            "triggered": value == 1,
            "message": "Local Unplanned Curfew / Zone Access Restriction",
            "threshold": "Sudden market closure or access denial"
        }

    return {
        "triggered": False,
        "message": "Unknown Trigger Type",
        "threshold": "N/A"
    }
