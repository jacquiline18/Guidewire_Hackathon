import { useEffect, useState } from "react";
import { api } from "../api";

export default function InsurancePlan({ rider, onBuy }) {
  const [plan, setPlan] = useState(null);

  useEffect(() => { api.getPlan().then(setPlan); }, []);

  if (!plan) return <div className="screen"><p>Loading plan...</p></div>;

  return (
    <div className="screen">
      <div className="card">
        <div className="badge badge-blue">Rider ID: {rider.riderId}</div>
        <h2>🛡️ InsurIntel Weekly Income Protection</h2>
        <div className="info-box">
          <p><strong>Coverage Includes:</strong></p>
          {plan.coverage.map((c) => <p key={c}>✔ {c}</p>)}
        </div>
        <div className="stat-row">
          <div className="stat"><span>Max Weekly Compensation</span><strong>₹{plan.maxWeeklyCompensation}</strong></div>
          <div className="stat"><span>Weekly Premium</span><strong>₹{plan.weeklyPremium}</strong></div>
          <div className="stat"><span>Duration</span><strong>{plan.durationDays} Days</strong></div>
        </div>
        <button onClick={() => onBuy(plan)}>Buy Weekly Coverage</button>
      </div>
    </div>
  );
}
