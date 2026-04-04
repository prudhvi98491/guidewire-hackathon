# GigGuard AI (No-NPM Frontend Version)

## Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Frontend Setup (No npm needed)
```bash
cd frontend
python -m http.server 5500
```

Then open:
http://127.0.0.1:5500

## Demo Flow
1. Register Rider
2. Calculate AI Premium
3. Create Policy
4. Trigger Event
5. Auto Claim Created
6. Zero-Touch Payout Simulation
