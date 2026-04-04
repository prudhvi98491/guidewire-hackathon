from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_models.risk_pricing import calculate_weekly_premium
from services.parametric_trigger import evaluate_trigger
from services.fraud_detection import validate_claim

app = FastAPI(title="GigGuard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

users = []
policies = []
claims = []

class RegisterRequest(BaseModel):
    name: str
    phone: str
    platform: str
    vehicle_type: str
    zone: str
    weekly_income: float

class PolicyRequest(BaseModel):
    user_id: int
    plan: str
    weekly_premium: float
    daily_payout: float

class TriggerRequest(BaseModel):
    user_id: int
    trigger_type: str
    value: float

def get_user_by_id(user_id: int):
    for user in users:
        if user["id"] == user_id:
            return user
    return None

def get_policy_by_user_id(user_id: int):
    for policy in policies:
        if policy["user_id"] == user_id:
            return policy
    return None

@app.get("/")
def root():
    return {"message": "GigGuard AI Backend Running"}

@app.post("/register")
def register_user(data: RegisterRequest):
    user_id = len(users) + 1
    user = {
        "id": user_id,
        "name": data.name,
        "phone": data.phone,
        "platform": data.platform,
        "vehicle_type": data.vehicle_type,
        "zone": data.zone,
        "weekly_income": data.weekly_income
    }
    users.append(user)
    return {"message": "User registered successfully", "user": user}

@app.post("/calculate-premium")
def calculate_premium(data: RegisterRequest):
    return calculate_weekly_premium(
        zone=data.zone,
        vehicle_type=data.vehicle_type,
        weekly_income=data.weekly_income
    )

@app.post("/create-policy")
def create_policy(data: PolicyRequest):
    existing_policy = get_policy_by_user_id(data.user_id)
    if existing_policy:
        return {"message": "Policy already exists for this user", "policy": existing_policy}

    policy = {
        "user_id": data.user_id,
        "plan": data.plan,
        "weekly_premium": data.weekly_premium,
        "daily_payout": data.daily_payout,
        "status": "Active",
        "covered_triggers": ["rain", "heat", "aqi", "platform_shutdown"]
    }
    policies.append(policy)
    return {"message": "Policy created successfully", "policy": policy}

@app.get("/policy/{user_id}")
def get_policy(user_id: int):
    policy = get_policy_by_user_id(user_id)
    if not policy:
        return {"message": "No policy found"}
    return policy

@app.post("/trigger-event")
def trigger_event(data: TriggerRequest):
    user = get_user_by_id(data.user_id)
    if not user:
        return {"message": "User not found"}

    policy = get_policy_by_user_id(data.user_id)
    trigger_result = evaluate_trigger(data.trigger_type, data.value)

    if not trigger_result["triggered"]:
        return {
            "message": "Trigger threshold not crossed. No claim created.",
            "trigger_result": trigger_result
        }

    fraud_result = validate_claim(user, policy, data.trigger_type, claims)

    if not fraud_result["valid"]:
        return {
            "message": "Claim rejected during fraud validation",
            "fraud_result": fraud_result
        }

    claim_id = len(claims) + 1
    payout_amount = policy["daily_payout"] if policy else 0

    claim = {
        "claim_id": claim_id,
        "user_id": data.user_id,
        "trigger_type": data.trigger_type,
        "trigger_value": data.value,
        "status": "Paid",
        "validation_status": "Approved",
        "payout_amount": payout_amount,
        "payout_status": "Success"
    }

    claims.append(claim)

    return {
        "message": "Zero-touch claim processed successfully",
        "trigger_result": trigger_result,
        "fraud_result": fraud_result,
        "claim": claim
    }

@app.get("/claims")
def get_all_claims():
    return claims

@app.get("/claims/{user_id}")
def get_user_claims(user_id: int):
    return [claim for claim in claims if claim["user_id"] == user_id]
