import { useState } from 'react';
import { Shield, CloudLightning, Activity, ShieldAlert, CheckCircle } from 'lucide-react';
import './index.css';

function App() {
  const [rider, setRider] = useState({ id: 'ZOM-10492', zone: 'Whitefield', vehicle: 'EV', earnings: 1200 });
  const [premiumData, setPremiumData] = useState<any>(null);
  const [claimStatus, setClaimStatus] = useState<any>(null);
  const [fraudData, setFraudData] = useState<any>(null);
  const [loading, setLoading] = useState('');

  const handleRiskProfile = async () => {
    setLoading('premium');
    try {
      const res = await fetch('http://localhost:8000/api/risk/calculate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_id: rider.id,
          zone: rider.zone,
          vehicle_type: rider.vehicle,
          avg_daily_earnings: rider.earnings
        })
      });
      const data = await res.json();
      setPremiumData(data);
    } catch(e) { console.error(e); }
    setLoading('');
  };

  const simulateTrigger = async () => {
    setLoading('trigger');
    try {
      const res = await fetch('http://localhost:8000/api/trigger/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: 'POL-99120',
          rider_id: rider.id,
          zone: rider.zone,
          daily_payout_inr: premiumData?.suggested_daily_payout_inr || 800
        })
      });
      const data = await res.json();
      setClaimStatus(data);
    } catch(e) { console.error(e); }
    setLoading('');
  };

  const handleFraudCheck = async () => {
    setLoading('fraud');
    try {
      const res = await fetch('http://localhost:8000/api/fraud/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_id: rider.id,
          claim_location_lat: 12.9698, // Bangalore coords mockup
          claim_location_lng: 77.7499,
          disruption_zone: rider.zone
        })
      });
      const data = await res.json();
      setFraudData(data);
    } catch(e) { console.error(e); }
    setLoading('');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-section">
          <Shield size={28} className="text-primary" />
          <h1 className="logo-text">GigGuard AI</h1>
        </div>
        <div className="rider-badge">
          <Activity size={16} />
          <span>Active: {rider.id} ({rider.zone})</span>
        </div>
      </header>

      <div className="grid">
        {/* Onboarding & Risk AI */}
        <div className="glass-card">
          <div className="card-header">
            <ShieldAlert className="text-primary" size={24} />
            <h2>AI Policy Engine</h2>
          </div>
          <p className="card-desc">Parametric pricing calculated dynamically based on historical API data.</p>
          
          <div className="control-group">
             <label>Operating Zone</label>
             <select className="control-input" value={rider.zone} onChange={e => setRider({...rider, zone: e.target.value})}>
               <option value="Whitefield">Whitefield (High Flood Risk)</option>
               <option value="Indiranagar">Indiranagar (Moderate)</option>
               <option value="Delhi_NCR">Delhi NCR (Extreme Heat Risk)</option>
             </select>
          </div>
          <div className="control-group">
             <label>Vehicle Type</label>
             <select className="control-input" value={rider.vehicle} onChange={e => setRider({...rider, vehicle: e.target.value})}>
               <option value="Bike">Petrol Bike</option>
               <option value="EV">Electric Vehicle (EV)</option>
               <option value="Cycle">Bicycle</option>
             </select>
          </div>

          <button className="btn btn-primary" onClick={handleRiskProfile} disabled={loading === 'premium'}>
            {loading === 'premium' ? 'Calculating Model...' : 'Assess Risk & Price Premium'}
          </button>

          {premiumData && (
            <div className="result-box">
              <div className="metric-row">
                <span className="metric-label">Weekly Premium</span>
                <span className="metric-value text-primary">₹{premiumData.weekly_premium_inr} / wk</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Max Daily Payout</span>
                <span className="metric-value">₹{premiumData.suggested_daily_payout_inr}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">AI Confidence</span>
                <span className="metric-value">{(premiumData.ai_confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Parametric Trigger Engine */}
        <div className="glass-card">
          <div className="card-header">
            <CloudLightning className="text-danger" size={24} />
            <h2>Weather Disruptions</h2>
          </div>
          <p className="card-desc">Simulate an external real-time webhook (e.g., OpenWeather) hitting the parametric trigger API.</p>

          <button className="btn btn-danger" onClick={simulateTrigger} disabled={!premiumData || loading === 'trigger'}>
             {loading === 'trigger' ? 'Polling Weather...' : 'Simulate Live Weather Event'}
          </button>

          {claimStatus && (
            <div className={`result-box ${claimStatus.status === 'TRIGGERED' ? 'danger' : ''}`}>
              <div className="metric-row">
                <span className="metric-label">Condition Status</span>
                <span className="metric-value">{claimStatus.status}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Disruption</span>
                <span className="metric-value">{claimStatus.reason}</span>
              </div>
              {claimStatus.status === 'TRIGGERED' && (
                <div className="metric-row" style={{marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem'}}>
                  <span className="metric-label" style={{fontWeight: '600'}}>Automated Payout</span>
                  <span className="metric-value text-danger">₹{claimStatus.payout_amount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fraud Detection */}
        <div className="glass-card">
          <div className="card-header">
            <CheckCircle className="text-success" size={24} />
            <h2>Fraud Validation</h2>
          </div>
          <p className="card-desc">Ensure the payout is legitimate: block duplicate requests and validate GPS location.</p>

          <button className="btn btn-warning" onClick={handleFraudCheck} disabled={!claimStatus || claimStatus.status !== 'TRIGGERED' || loading === 'fraud'}>
            {loading === 'fraud' ? 'Validating...' : 'Run Fraud Detection Algorithm'}
          </button>

          {fraudData && (
            <div className={`result-box ${fraudData.fraud_detected ? 'danger' : 'success'}`}>
               <div className="metric-row">
                <span className="metric-label">Claim Status</span>
                <span className="metric-value">
                  {fraudData.fraud_detected ? 'REJECTED (FRAUD)' : 'APPROVED'}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">System Note</span>
                <span className="metric-value" style={{fontSize: '0.875rem'}}>{fraudData.reason}</span>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Dashboard */}
        <div className="glass-card" style={{gridColumn: '1 / -1'}}>
          <div className="card-header">
            <Activity className="text-primary" size={24} />
            <h2>Platform Analytics (Admin)</h2>
          </div>
          <p className="card-desc">Real-time metrics for Guidewire core systems.</p>
          <div className="grid">
             <div className="result-box" style={{marginTop: 0}}>
                <div className="metric-row"><span className="metric-label">Active Policies</span><span className="metric-value text-primary">12,450</span></div>
             </div>
             <div className="result-box" style={{marginTop: 0}}>
                <div className="metric-row"><span className="metric-label">Total Premiums (Wk)</span><span className="metric-value text-success">₹4.2M</span></div>
             </div>
             <div className="result-box" style={{marginTop: 0}}>
                <div className="metric-row"><span className="metric-label">Recent Triggers</span><span className="metric-value text-danger">142</span></div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App;
