def evaluate_trigger(trigger_type: str, value: float):
    trigger_type = trigger_type.lower()

    if trigger_type == "rain":
        return {
            "triggered": value > 15,
            "message": "Heavy Rain / Flood Trigger Evaluated",
            "threshold": "Rainfall > 15 mm/hr"
        }

    elif trigger_type == "heat":
        return {
            "triggered": value > 42,
            "message": "Extreme Heat Trigger Evaluated",
            "threshold": "Temperature > 42°C"
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

    return {
        "triggered": False,
        "message": "Unknown Trigger Type",
        "threshold": "N/A"
    }
