import { useState, useEffect, useRef } from 'react';
import { 
  Shield, CloudLightning, Activity, ShieldAlert, CheckCircle, 
  MapPin, Sliders, Play, Lock, Terminal, RefreshCw, Bike, Cpu, 
  Coins, User, AlertCircle, Compass, Thermometer, CloudRain
} from 'lucide-react';
import './index.css';

interface LedgerItem {
  id: string;
  text: string;
  type: 'system' | 'trigger' | 'fraud' | 'success';
  time: string;
}

function App() {
  const [rider, setRider] = useState({ id: 'ZOM-10492', zone: 'Whitefield', vehicle: 'EV', earnings: 1200 });
  const [premiumData, setPremiumData] = useState<any>(null);
  const [claimStatus, setClaimStatus] = useState<any>(null);
  const [fraudData, setFraudData] = useState<any>(null);
  const [loading, setLoading] = useState('');
  
  // Custom weather overrides
  const [useCustomWeather, setUseCustomWeather] = useState(true);
  const [overrideRain, setOverrideRain] = useState(20);
  const [overrideTemp, setOverrideTemp] = useState(30);

  // Fraud override
  const [gpsAnomaly, setGpsAnomaly] = useState(false);

  // Ledger state for terminal logs
  const [ledger, setLedger] = useState<LedgerItem[]>([
    { id: 'init', text: 'SYSTEM: GigGuard Parametric Insurance Core V2 initialized.', type: 'system', time: '10:00:00' },
    { id: 'sync', text: 'SYSTEM: Established secure websocket connection to Guidewire PolicyCenter.', type: 'system', time: '10:00:02' }
  ]);

  const ledgerEndRef = useRef<HTMLDivElement>(null);

  const addLedgerEntry = (text: string, type: 'system' | 'trigger' | 'fraud' | 'success') => {
    const timeString = new Date().toLocaleTimeString();
    setLedger(prev => [
      ...prev,
      { id: Math.random().toString(), text, type, time: timeString }
    ]);
  };

  // Auto scroll terminal logs
  useEffect(() => {
    if (ledgerEndRef.current) {
      ledgerEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ledger]);

  // Sync default weather values when zone changes
  useEffect(() => {
    if (rider.zone === 'Whitefield') {
      setOverrideRain(20);
      setOverrideTemp(28);
    } else if (rider.zone === 'Delhi_NCR') {
      setOverrideRain(0);
      setOverrideTemp(45);
    } else {
      setOverrideRain(0);
      setOverrideTemp(28);
    }
  }, [rider.zone]);

  const handleRiskProfile = async () => {
    setLoading('premium');
    addLedgerEntry(`POLICYCENTER: Fetching quote request for Rider ${rider.id}...`, 'system');
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
      addLedgerEntry(`POLICYCENTER: Premium calculated ₹${data.weekly_premium_inr}/wk. Suggested daily payout ₹${data.suggested_daily_payout_inr}. Risk: ${data.risk_level}`, 'system');
      addLedgerEntry(`POLICYCENTER: Created draft policy POL-99120. Synced with PolicyCenter database.`, 'system');
      // Reset claim and fraud on new policy assessment
      setClaimStatus(null);
      setFraudData(null);
    } catch(e) { 
      console.error(e);
      addLedgerEntry(`ERROR: Failed to connect to risk assessment backend. Is FastAPI server running?`, 'fraud');
    }
    setLoading('');
  };

  const simulateTrigger = async () => {
    setLoading('trigger');
    addLedgerEntry(`WEATHER_API: Interrogating weather sensors for operating zone: ${rider.zone}...`, 'trigger');
    
    // Construct payload including custom parameters
    const bodyPayload = {
      policy_id: 'POL-99120',
      rider_id: rider.id,
      zone: rider.zone,
      daily_payout_inr: premiumData?.suggested_daily_payout_inr || 960,
      custom_rain_mm_hr: useCustomWeather ? overrideRain : undefined,
      custom_temp_c: useCustomWeather ? overrideTemp : undefined
    };

    try {
      const res = await fetch('http://localhost:8000/api/trigger/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      setClaimStatus(data);

      if (data.status === 'TRIGGERED') {
        addLedgerEntry(`PARAMETRIC_TRIGGER: Disruptive condition hit! ${data.reason}`, 'trigger');
        addLedgerEntry(`CLAIMCENTER: Parametric trigger hit. Automated claim initiated in ClaimCenter.`, 'trigger');
      } else {
        addLedgerEntry(`PARAMETRIC_TRIGGER: Checked. ${data.reason}. Weather conditions normal: Temp=${data.weather_data?.temp_c}°C, Rain=${data.weather_data?.rain_mm_hr}mm/hr`, 'trigger');
      }
      setFraudData(null); // Clear previous fraud data
    } catch(e) { 
      console.error(e);
      addLedgerEntry(`ERROR: Trigger evaluation failed.`, 'fraud');
    }
    setLoading('');
  };

  const handleFraudCheck = async () => {
    setLoading('fraud');
    addLedgerEntry(`FRAUD_CORE: Running vetting validations for policy POL-99120...`, 'fraud');
    
    // Simulate coordinates based on anomaly switch
    const lat = gpsAnomaly ? 0.0 : 12.9698;
    const lng = gpsAnomaly ? 0.0 : 77.7499;

    try {
      const res = await fetch('http://localhost:8000/api/fraud/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_id: rider.id,
          claim_location_lat: lat,
          claim_location_lng: lng,
          disruption_zone: rider.zone
        })
      });
      const data = await res.json();
      setFraudData(data);

      if (data.fraud_detected) {
        addLedgerEntry(`FRAUD_ALERT: Anomaly detected! Reason: ${data.reason}`, 'fraud');
        addLedgerEntry(`CLAIMCENTER: Claim marked FRAUD/SUSPENDED. Payout halted.`, 'fraud');
      } else {
        addLedgerEntry(`FRAUD_CORE: Vetting passed. Claim verified. Confidence score 98%`, 'success');
        addLedgerEntry(`CLAIMCENTER: Claim CC-1092 set to SETTLED. Synced to ClaimCenter ledger.`, 'success');
        addLedgerEntry(`PAYMENT_GW: Disbursed Instant Payout of ₹${claimStatus?.payout_amount || 960} to Rider Wallet via UPI.`, 'success');
      }
    } catch(e) { 
      console.error(e);
      addLedgerEntry(`ERROR: Fraud validation engine offline.`, 'fraud');
    }
    setLoading('');
  };

  // Helper to determine map rider position coordinates
  const getRiderCoordinates = () => {
    switch(rider.zone) {
      case 'Whitefield': return { left: '75%', top: '50%' };
      case 'Indiranagar': return { left: '42%', top: '35%' };
      case 'Delhi_NCR': return { left: '80%', top: '20%' };
      default: return { left: '20%', top: '75%' }; // Default/Koramangala
    }
  };

  const riderPos = getRiderCoordinates();

  return (
    <div className="app-container">
      {/* Navbar Section */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon-container">
            <Shield size={26} className="text-primary" style={{ stroke: 'white' }} />
          </div>
          <h1 className="logo-text">GigGuard AI</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="rider-badge">
            <Compass size={16} className="text-primary" />
            <span>Telemetry: GPS Active</span>
          </div>
          <div className="rider-badge">
            <div className="pulse-dot"></div>
            <span>Rider: {rider.id}</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid">
        
        {/* Row 1, Col-4: Rider Onboarding & AI Policy Engine */}
        <div className="glass-card col-4">
          <div className="card-header">
            <User className="text-primary" size={22} />
            <h2>AI Policy Engine</h2>
          </div>
          <p className="card-desc">Calculate customizable parametric cover quotes tailored to rider profile data.</p>
          
          <div className="control-group">
            <label>
              <span>Rider Identifier</span>
            </label>
            <input 
              type="text" 
              className="control-input" 
              value={rider.id} 
              onChange={e => setRider({...rider, id: e.target.value})} 
            />
          </div>

          <div className="control-group">
            <label>
              <span>Operating Hazard Zone</span>
            </label>
            <select 
              className="control-input" 
              value={rider.zone} 
              onChange={e => setRider({...rider, zone: e.target.value})}
            >
              <option value="Whitefield">Whitefield (High Flood Risk)</option>
              <option value="Indiranagar">Indiranagar (Moderate Risk)</option>
              <option value="Delhi_NCR">Delhi NCR (Extreme Heat Risk)</option>
              <option value="Koramangala">Koramangala (Low Risk)</option>
            </select>
          </div>

          <div className="control-group">
            <label>Vehicle Architecture</label>
            <div className="vehicle-selector">
              <div 
                className={`vehicle-card ${rider.vehicle === 'Bike' ? 'active' : ''}`}
                onClick={() => setRider({...rider, vehicle: 'Bike'})}
              >
                <Bike size={18} />
                <span>Petrol Bike</span>
              </div>
              <div 
                className={`vehicle-card ${rider.vehicle === 'EV' ? 'active' : ''}`}
                onClick={() => setRider({...rider, vehicle: 'EV'})}
              >
                <Cpu size={18} />
                <span>EV Scooter</span>
              </div>
              <div 
                className={`vehicle-card ${rider.vehicle === 'Cycle' ? 'active' : ''}`}
                onClick={() => setRider({...rider, vehicle: 'Cycle'})}
              >
                <Compass size={18} />
                <span>Bicycle</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <label>
              <span>Avg. Daily Earnings</span>
              <span className="text-primary" style={{ fontWeight: 600 }}>₹{rider.earnings}</span>
            </label>
            <input 
              type="range" 
              min="200" 
              max="3000" 
              step="100"
              className="slider-input" 
              value={rider.earnings}
              onChange={e => setRider({...rider, earnings: parseInt(e.target.value)})}
            />
          </div>

          <button className="btn btn-primary" onClick={handleRiskProfile} disabled={loading === 'premium'}>
            {loading === 'premium' ? <RefreshCw className="animate-spin" size={16} /> : <Sliders size={16} />}
            <span>Assess Risk & Bind Policy</span>
          </button>

          {premiumData && (
            <div className="result-box">
              <div className="metric-row">
                <span className="metric-label">Weekly Premium</span>
                <span className="metric-value text-primary">₹{premiumData.weekly_premium_inr} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/ week</span></span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Suggested Daily Payout</span>
                <span className="metric-value text-primary">₹{premiumData.suggested_daily_payout_inr}</span>
              </div>
              
              <div className="gauge-container">
                <span className="metric-label" style={{ minWidth: '70px' }}>Risk Rating:</span>
                <div className="gauge-track">
                  <div 
                    className={`gauge-fill ${premiumData.risk_level.toLowerCase()}`}
                    style={{ width: premiumData.risk_level === 'High' ? '90%' : '50%' }}
                  ></div>
                </div>
                <span className={`metric-value ${premiumData.risk_level === 'High' ? 'text-danger' : 'text-success'}`} style={{ fontSize: '0.85rem' }}>
                  {premiumData.risk_level}
                </span>
              </div>
              <div className="metric-row" style={{ marginTop: '0.75rem' }}>
                <span className="metric-label">AI Pricing Confidence</span>
                <span className="metric-value" style={{ fontSize: '0.9rem' }}>
                  {(premiumData.ai_confidence * 100).toFixed(0)}% <span className="ai-badge">Validated</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Row 1, Col-4: Interactive Weather & Parametric Trigger Simulation */}
        <div className="glass-card col-4">
          <div className="card-header">
            <CloudLightning className="text-danger" size={22} style={{ stroke: 'var(--danger)' }} />
            <h2>Parametric Trigger Simulation</h2>
          </div>
          <p className="card-desc">Simulate sensor metrics to trigger automated parametric payouts instantly.</p>
          
          <div className="switch-container">
            <span className="switch-label">Manual Weather Simulation Overrides</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={useCustomWeather} 
                onChange={e => setUseCustomWeather(e.target.checked)} 
              />
              <span className="slider-switch"></span>
            </label>
          </div>

          <div style={{ opacity: useCustomWeather ? 1 : 0.4, transition: 'all 0.3s', marginTop: '1.25rem' }}>
            <div className="control-group">
              <label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CloudRain size={16} className="text-primary" />
                  Precipitation (Rainfall)
                </span>
                <span className="text-primary" style={{ fontWeight: 600 }}>{overrideRain} mm/hr</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="60" 
                disabled={!useCustomWeather}
                className="slider-input" 
                value={overrideRain}
                onChange={e => setOverrideRain(parseInt(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>0 mm/hr (Dry)</span>
                <span className="text-danger" style={{ fontWeight: '500' }}>Threshold: 15 mm/hr</span>
                <span>60 mm/hr (Storm)</span>
              </div>
            </div>

            <div className="control-group" style={{ marginTop: '1.5rem' }}>
              <label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Thermometer size={16} className="text-primary" />
                  Sensory Temperature
                </span>
                <span className="text-primary" style={{ fontWeight: 600 }}>{overrideTemp} °C</span>
              </label>
              <input 
                type="range" 
                min="15" 
                max="50" 
                disabled={!useCustomWeather}
                className="slider-input" 
                value={overrideTemp}
                onChange={e => setOverrideTemp(parseInt(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>15 °C (Cool)</span>
                <span className="text-danger" style={{ fontWeight: '500' }}>Threshold: 42 °C</span>
                <span>50 °C (Heatwave)</span>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-danger" 
            onClick={simulateTrigger} 
            disabled={!premiumData || loading === 'trigger'}
          >
            {loading === 'trigger' ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
            <span>Simulate Weather Event Check</span>
          </button>

          {claimStatus && (
            <div className={`result-box ${claimStatus.status === 'TRIGGERED' ? 'danger' : ''}`}>
              <div className="metric-row">
                <span className="metric-label">Simulation Result</span>
                <span className={`metric-value ${claimStatus.status === 'TRIGGERED' ? 'text-danger' : 'text-success'}`}>
                  {claimStatus.status}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Details</span>
                <span className="metric-value" style={{ fontSize: '0.9rem' }}>{claimStatus.reason}</span>
              </div>
              {claimStatus.status === 'TRIGGERED' && (
                <div className="metric-row" style={{ marginTop: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                  <span className="metric-label" style={{ fontWeight: '600', color: 'white' }}>Pending payout</span>
                  <span className="metric-value text-danger" style={{ fontSize: '1.1rem' }}>₹{claimStatus.payout_amount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 1, Col-4: Simulated Weather Map & Radar */}
        <div className="glass-card col-4">
          <div className="card-header">
            <Compass className="text-primary" size={22} />
            <h2>Interactive Hazard Radar</h2>
          </div>
          <p className="card-desc">Real-time GPS tracker plotting active policyholders against severe environmental hazards.</p>
          
          <div className="map-canvas">
            <div className="map-grid-overlay"></div>
            <div className="map-radar-scan"></div>
            
            {/* Weather animation overlay inside map */}
            {useCustomWeather && overrideRain >= 15 && (
              <div className="weather-overlay">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="rain-drop" 
                    style={{ 
                      left: `${(i * 7) + 5}%`, 
                      animationDelay: `${Math.random() * 0.8}s`,
                      animationDuration: `${0.5 + Math.random() * 0.4}s`
                    }}
                  />
                ))}
              </div>
            )}
            
            {useCustomWeather && overrideTemp >= 42 && (
              <div className="weather-overlay heat-wave"></div>
            )}

            {/* Map Nodes representing zones */}
            <div className={`map-node ${rider.zone === 'Whitefield' ? (useCustomWeather && overrideRain >= 15 ? 'hazard' : 'active') : ''}`} style={{ left: '75%', top: '50%' }}>
              <div className="map-node-dot"></div>
              <div className="map-node-label">Whitefield</div>
            </div>
            
            <div className={`map-node ${rider.zone === 'Indiranagar' ? 'active' : ''}`} style={{ left: '42%', top: '35%' }}>
              <div className="map-node-dot"></div>
              <div className="map-node-label">Indiranagar</div>
            </div>

            <div className={`map-node ${rider.zone === 'Delhi_NCR' ? (useCustomWeather && overrideTemp >= 42 ? 'hazard' : 'active') : ''}`} style={{ left: '80%', top: '20%' }}>
              <div className="map-node-dot"></div>
              <div className="map-node-label">Delhi NCR</div>
            </div>

            <div className={`map-node ${rider.zone === 'Koramangala' ? 'active' : ''}`} style={{ left: '20%', top: '75%' }}>
              <div className="map-node-dot"></div>
              <div className="map-node-label">Koramangala</div>
            </div>

            {/* Animated Rider Avatar */}
            <div className="map-rider-avatar" style={riderPos}>
              <div className="rider-marker">
                <Bike size={12} color="white" />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="map-node-dot" style={{ backgroundColor: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }}></div>
              <span className="text-secondary">Selected Zone</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="map-node-dot" style={{ backgroundColor: 'var(--danger)', boxShadow: '0 0 6px var(--danger)' }}></div>
              <span className="text-secondary">Active Weather Warning</span>
            </div>
          </div>
        </div>

        {/* Row 2: Fraud Detection Console (Col-5) */}
        <div className="glass-card col-5">
          <div className="card-header">
            <CheckCircle className="text-success" size={22} style={{ stroke: 'var(--success)' }} />
            <h2>Fraud Detection Core</h2>
          </div>
          <p className="card-desc">Execute enterprise anti-fraud checks to safeguard against false claims.</p>

          <div className="switch-container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span className="switch-label" style={{ fontWeight: '500', color: 'white' }}>Trigger GPS Coordinate Anomaly</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Forces rider telemetry coordinates to (0.0, 0.0)</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={gpsAnomaly} 
                onChange={e => setGpsAnomaly(e.target.checked)} 
              />
              <span className="slider-switch"></span>
            </label>
          </div>

          <button 
            className="btn btn-warning" 
            onClick={handleFraudCheck} 
            disabled={!claimStatus || claimStatus.status !== 'TRIGGERED' || loading === 'fraud'}
          >
            {loading === 'fraud' ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
            <span>Run Guidewire Fraud Audit</span>
          </button>

          {fraudData && (
            <div className={`result-box ${fraudData.fraud_detected ? 'danger' : 'success'}`}>
              <div className="metric-row">
                <span className="metric-label">Vetting Resolution</span>
                <span className={`metric-value ${fraudData.fraud_detected ? 'text-danger' : 'text-success'}`} style={{ fontWeight: '700' }}>
                  {fraudData.fraud_detected ? 'REJECTED (FRAUD ALERT)' : 'APPROVED FOR SETTLEMENT'}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Audit Remarks</span>
                <span className="metric-value" style={{ fontSize: '0.875rem' }}>{fraudData.reason}</span>
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Guidewire Sync Ledger Console (Col-7) */}
        <div className="glass-card col-7">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Terminal className="text-primary" size={22} />
              <h2>Guidewire Sync Ledger</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setLedger([
                  { id: 'init', text: 'SYSTEM: GigGuard Parametric Insurance Core V2 initialized.', type: 'system', time: new Date().toLocaleTimeString() },
                  { id: 'sync', text: 'SYSTEM: Established secure websocket connection to Guidewire PolicyCenter.', type: 'system', time: new Date().toLocaleTimeString() }
                ])}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Clear Logs"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
          <p className="card-desc">Direct interface sync logs showing real-time ledger updates to PolicyCenter and ClaimCenter.</p>

          <div className="ledger-panel">
            <div className="ledger-header">
              <span>SERVICE COMPONENT</span>
              <span>CONNECTION: SECURE [TLS 1.3]</span>
            </div>
            {ledger.map((item) => (
              <div key={item.id} className={`ledger-row ${item.type}`}>
                <span className="time">[{item.time}]</span>
                {item.text}
              </div>
            ))}
            <div ref={ledgerEndRef} />
          </div>
        </div>

        {/* Row 3: Admin Platform Performance Analytics */}
        <div className="glass-card col-12">
          <div className="card-header">
            <Activity className="text-primary" size={22} />
            <h2>Platform Operations Dashboard (Admin)</h2>
          </div>
          <p className="card-desc">System health, performance parameters, and capital metrics synced with Guidewire Cloud.</p>
          
          <div className="grid" style={{ width: '100%', gap: '1rem' }}>
            <div className="glass-card" style={{ gridColumn: 'span 3', padding: '1rem', background: 'rgba(30, 41, 59, 0.2)', marginBottom: 0 }}>
              <div className="metric-row" style={{ marginBottom: '0.25rem' }}>
                <span className="metric-label">Active Premium Policies</span>
              </div>
              <span className="text-gradient-cyan-blue" style={{ fontSize: '1.75rem', fontWeight: 800 }}>12,450</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>+18% growth this week</div>
            </div>
            
            <div className="glass-card" style={{ gridColumn: 'span 3', padding: '1rem', background: 'rgba(30, 41, 59, 0.2)', marginBottom: 0 }}>
              <div className="metric-row" style={{ marginBottom: '0.25rem' }}>
                <span className="metric-label">Total GWP (Weekly)</span>
              </div>
              <span className="text-success" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>₹4.28M</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Average premium: ₹34</div>
            </div>

            <div className="glass-card" style={{ gridColumn: 'span 3', padding: '1rem', background: 'rgba(30, 41, 59, 0.2)', marginBottom: 0 }}>
              <div className="metric-row" style={{ marginBottom: '0.25rem' }}>
                <span className="metric-label">Parametric Claims Settled</span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>1,842</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>100% automated payouts</div>
            </div>

            <div className="glass-card" style={{ gridColumn: 'span 3', padding: '1rem', background: 'rgba(30, 41, 59, 0.2)', marginBottom: 0 }}>
              <div className="metric-row" style={{ marginBottom: '0.25rem' }}>
                <span className="metric-label">System Payout Speed</span>
              </div>
              <span className="text-gradient-cyan-blue" style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #fbbf24, #f59e0b)' }}>&lt; 4.2s</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>API webhook validation time</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
