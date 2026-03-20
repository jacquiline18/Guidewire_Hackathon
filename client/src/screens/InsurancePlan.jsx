import { useEffect, useState } from "react";
import { api } from "../api";

export default function InsurancePlan({ rider, onBuy }) {
  const [plan, setPlan] = useState(null);

  useEffect(() => { api.getPlan().then(setPlan); }, []);

  if (!plan) return <div className="screen"><div className="card"><p>Loading plan...</p></div></div>;

  return (
    <div className="screen">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="badge badge-green" style={{ marginBottom: 10 }}>🛡️ Weekly Plan</div>
            <h2>InsurIntel Income Protection</h2>
            <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: "0.97rem" }}>
              Automatic payouts when weather disrupts your work.
            </p>
          </div>
          <div className="badge badge-blue">Rider: {rider.riderId}</div>
        </div>

        <div className="divider" />

        <div>
          <p className="section-label">What's Covered</p>
          <div className="coverage-tags" style={{ marginTop: 12 }}>
            {plan.coverage.map((c) => (
              <div key={c} className="coverage-tag">
                <span className="dot" />
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="stat-row">
          <div className="stat">
            <span>Max Weekly Payout</span>
            <strong>₹{plan.maxWeeklyCompensation}</strong>
          </div>
          <div className="stat">
            <span>Weekly Premium</span>
            <strong>₹{plan.weeklyPremium}</strong>
          </div>
          <div className="stat">
            <span>Coverage Duration</span>
            <strong>{plan.durationDays} Days</strong>
          </div>
        </div>

        <div className="info-box green-box">
          <p>✅ Claims are <strong>automatically triggered</strong> — no manual filing needed.</p>
          <p>✅ Fraud checks run instantly before every payout.</p>
        </div>

        <button onClick={() => onBuy(plan)}>Buy Weekly Coverage — ₹{plan.weeklyPremium} →</button>
      </div>
    </div>
  );
}
