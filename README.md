# 🛡️ Kavach AI: The Climate-Adaptive Wage Protocol (CAWP)

> **"Built with humans, not just prompts."**
> Kavach AI moves beyond the "GigShield" template. It is an opinionated, scientifically-driven preservation layer for India's gig economy delivery partners.

## 🚀 Why Kavach AI is Different (Phase 2 Perspective)

Phase 2 evaluators warned against "AI output as a project." Kavach AI was built with a specific **point of view**: traditional insurance fails gig workers because it relies on damage assessment (paperwork). We replace this with **Parametric Multi-Signal Logic**.

### 🔬 Original Science: Heat-Humid Stress Index (HHI)
Unlike standard projects that use simple `Temperature > 40°C` logic, Kavach AI uses the **Wet-Bulb Temperature (HHI)**. 
- **The India Context:** 35°C in Mumbai (high humidity) is scientifically more dangerous than 45°C in Jodhpur (dry heat). 
- **Our Protocol:** Monitors the **interaction** of temperature and humidity to trigger safety payouts before a rider suffers heatload exhaustion.

### 🤝 Social Innovation: The Digital Solidarity Pool
Kavach AI isn't just a payout engine; it's a social protocol.
- **The Concept:** 5% of un-used weekly premiums are diverted into a **Solidarity Pool**. 
- **The Purpose:** In the event of catastrophic regional disasters (e.g., Chennai 2023 Floods), this pool is activated to **boost** the parametric payouts for riders in the affected zone, providing a community-funded safety net.

---

## 🏗️ Technical Deliverables

- **Live Interative Demo:** [https://g-s-jithesh.github.io/guidewire-hackathon/guidewire-hackathon-main-nonpm/frontend/index.html](https://g-s-jithesh.github.io/guidewire-hackathon/guidewire-hackathon-main-nonpm/frontend/index.html)
- **Live API (Render):** [https://guidewire-hackathon-clzu.onrender.com](https://guidewire-hackathon-clzu.onrender.com)
- **Architecture:** Zero-Touch Parametric Payouts via FastAPI + Guidewire Integration Mocks.
- **6 Multi-Signal Triggers:** 
    1.  **Monsoon Breach** (>20mm/hr)
    2.  **Heat Stress Index** (Wet-Bulb Trigger)
    3.  **AQI Toxicity** (>300 Severe)
    4.  **Network/Platform Halts**
    5.  **Regional Infrastructure Outage** (Internet)
    6.  **Sudden Flash Curfews**

---

## 🔄 Protocol Workflow (The Human Factor)

### 1. The Anchoring Phase (Risk Evaluation)
The rider logs their Platform and Zone. Kavach AI's **Vulnerability Scoring** evaluates their vehicle resilience (Petrol vs EV) and zone histography (Flood-risk Whitefield). This creates a **Dynamic Risk-Weighted Premium**.

### 2. The Active Monitoring (Parametric Webhooks)
Kavach AI continuously polls environmental and social telemetry. No "Accept" button is needed by the rider. If a trigger (e.g. 39°C Wet-Bulb Stress) is hit, the protocol fires.

### 3. The Instant Zero-Touch Settlement
Before payout, the **Fraud-Clear Engine** (Telemetric GPS check) ensures the rider was active and affected. Once cleared, the **Guidewire ClaimCenter** (simulation) initiates an instant bank transfer.

---

## 🛠️ Setup Instructions (For Evaluators)

This repository includes a **Standalone Standalone Version** (non-npm) for zero-latency testing.

### 1. Backend (FastAPI)
```bash
cd guidewire-hackathon-main-nonpm/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend (Live or Local)
Open `guidewire-hackathon-main-nonpm/frontend/index.html` in any browser. It is already pre-configured to communicate with our **Live Render Backend**.
