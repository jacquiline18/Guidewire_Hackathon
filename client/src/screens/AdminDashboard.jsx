import { useEffect, useState } from "react";
import { api } from "../api";

const riskColor = { High: "red", Medium: "orange", Low: "green" };

export default function AdminDashboard({ onBack }) {
  const [data, setData] = useState(null);

  useEffect(() => { api.getAdminDashboard().then(setData); }, []);

  if (!data) return <div className="screen"><p>Loading admin data...</p></div>;

  return (
    <div className="screen">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>🖥️ Admin Dashboard</h2>
          <button className="btn-small" onClick={onBack}>← Back</button>
        </div>

        <div className="stat-row">
          <div className="stat"><span>Total Riders</span><strong>{data.totalRiders}</strong></div>
          <div className="stat"><span>Active Policies</span><strong>{data.activePolicies}</strong></div>
          <div className="stat"><span>Disruptions Today</span><strong>{data.disruptionsToday}</strong></div>
          <div className="stat"><span>Total Claims</span><strong>{data.totalClaims}</strong></div>
          <div className="stat"><span>Total Paid Out</span><strong>₹{data.totalCompensationPaid}</strong></div>
        </div>

        <p><strong>🗺️ Risk Zones</strong></p>
        <div className="risk-grid">
          {data.riskZones.map((z) => (
            <div key={z.city} className="risk-card">
              <span>{z.city}</span>
              <span style={{ color: riskColor[z.risk] || "gray" }}>{z.risk} Risk</span>
            </div>
          ))}
        </div>

        {data.recentClaims.length > 0 && (
          <>
            <p><strong>Recent Claims</strong></p>
            <ul className="activity-list">
              {data.recentClaims.map((c) => (
                <li key={c.claimId}>
                  <span>{c.claimId}</span>
                  <span>{c.riderName} — {c.eventType}</span>
                  <span className="green">₹{c.compensation}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
