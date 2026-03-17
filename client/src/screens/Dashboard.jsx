import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard({ rider, onSimulate }) {
  const [data, setData] = useState(null);

  const load = () => api.getDashboard(rider.riderId).then(setData);

  useEffect(() => { load(); }, []);

  if (!data) return <div className="screen"><p>Loading...</p></div>;

  const { policy, transactions, claims } = data;
  const r = data.rider;

  return (
    <div className="screen">
      <div className="card">
        <h2>Welcome {r.name} 👋</h2>
        <div className="stat-row">
          <div className="stat">
            <span>Insurance Status</span>
            <strong className={policy ? "green" : "red"}>{policy ? "ACTIVE ✅" : "INACTIVE"}</strong>
          </div>
          <div className="stat">
            <span>Wallet Balance</span>
            <strong>₹{r.wallet}</strong>
          </div>
        </div>

        {policy && (
          <div className="info-box">
            <p><strong>Your Coverage</strong></p>
            <p>Weekly Premium: ₹{policy.weeklyPremium}</p>
            <p>Max Compensation: ₹{policy.maxCompensation}</p>
            <p>Valid Until: {new Date(policy.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>
          </div>
        )}

        {claims.length > 0 && (
          <div className="info-box green-box">
            <p><strong>Latest Claim</strong></p>
            <p>{claims[claims.length - 1].eventType} — ₹{claims[claims.length - 1].compensation} credited ✅</p>
          </div>
        )}

        <p><strong>Recent Activity</strong></p>
        <ul className="activity-list">
          {transactions.map((t) => (
            <li key={t.txnId}>
              <span>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span>{t.description}</span>
              <span className={t.amount > 0 ? "green" : "red"}>{t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount)}</span>
            </li>
          ))}
        </ul>

        <button className="btn-secondary" onClick={() => { load(); onSimulate(); }}>
          🌧️ Simulate Weather Disruption
        </button>
      </div>
    </div>
  );
}
