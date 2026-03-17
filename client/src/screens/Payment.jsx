import { useState } from "react";
import { api } from "../api";

export default function Payment({ rider, plan, onSuccess }) {
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pay = async () => {
    setLoading(true);
    const res = await api.buyPolicy({ riderId: rider.riderId, paymentMethod: method });
    setLoading(false);
    if (!res.error) setResult(res);
  };

  if (result) return (
    <div className="screen">
      <div className="card center">
        <div className="success-icon">✅</div>
        <h2>Payment Successful!</h2>
        <p>Transaction ID: <strong>{result.txnId}</strong></p>
        <p>Coverage Active for <strong>7 Days</strong></p>
        <button onClick={() => onSuccess(result)}>Go To Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="card">
        <h2>💳 Payment Summary</h2>
        <div className="info-box">
          <p>Weekly Premium: <strong>₹{plan.weeklyPremium}</strong></p>
          <p>Coverage Duration: <strong>7 Days</strong></p>
        </div>
        <p><strong>Payment Method:</strong></p>
        <div className="radio-group">
          {["UPI", "Debit Card", "Wallet"].map((m) => (
            <label key={m} className="radio-label">
              <input type="radio" value={m} checked={method === m} onChange={() => setMethod(m)} /> {m}
            </label>
          ))}
        </div>
        <button onClick={pay} disabled={loading}>{loading ? "Processing..." : "Pay Now ₹30"}</button>
      </div>
    </div>
  );
}
