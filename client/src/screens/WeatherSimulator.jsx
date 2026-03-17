import { useState } from "react";
import { api } from "../api";

export default function WeatherSimulator({ rider, onDone }) {
  const [form, setForm] = useState({ city: rider.city, rainfall: "95", temperature: "29", aqi: "120" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const simulate = async () => {
    setLoading(true);
    const res = await api.simulateWeather(form);
    setLoading(false);
    setResult(res);
  };

  if (result) {
    const claim = result.generatedClaims?.find((c) => c.riderId === rider.riderId);
    return (
      <div className="screen">
        <div className="card">
          <h2>🌧️ Weather Event Processed</h2>
          <div className="info-box">
            <p>City: <strong>{form.city}</strong></p>
            <p>Rainfall: <strong>{form.rainfall} mm</strong></p>
            <p>Temperature: <strong>{form.temperature}°C</strong></p>
            <p>AQI: <strong>{form.aqi}</strong></p>
          </div>
          {result.disruptions?.length > 0 ? (
            <div className="info-box red-box">
              <p>⚠️ Disruption Detected: <strong>{result.disruptions.join(", ")}</strong></p>
            </div>
          ) : (
            <p>✅ No disruption threshold exceeded.</p>
          )}
          {claim ? (
            <div className="info-box green-box">
              <p><strong>Claim Auto-Generated ✅</strong></p>
              <p>Claim ID: {claim.claimId}</p>
              <p>Compensation: <strong>₹{claim.compensation}</strong> credited</p>
              <p>Fraud Checks: Location ✔ No Duplicate ✔ Active ✔</p>
              <p>Status: <strong>APPROVED</strong></p>
            </div>
          ) : result.disruptions?.length > 0 ? (
            <p className="error">No active policy found for this rider.</p>
          ) : null}
          <button onClick={onDone}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="card">
        <h2>🌦️ Simulate Weather Event</h2>
        <label>City</label>
        <select name="city" value={form.city} onChange={handle}>
          {["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <label>Rainfall (mm) — trigger if &gt; 80</label>
        <input name="rainfall" type="number" value={form.rainfall} onChange={handle} />
        <label>Temperature (°C) — trigger if &gt; 42</label>
        <input name="temperature" type="number" value={form.temperature} onChange={handle} />
        <label>AQI — trigger if &gt; 200</label>
        <input name="aqi" type="number" value={form.aqi} onChange={handle} />
        <button onClick={simulate} disabled={loading}>{loading ? "Simulating..." : "Trigger Weather Event"}</button>
        <button className="btn-secondary" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
