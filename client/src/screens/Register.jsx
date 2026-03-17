import { useState } from "react";
import { api } from "../api";

export default function Register({ onRegistered }) {
  const [form, setForm] = useState({ name: "", phone: "", city: "Chennai", platform: "Swiggy", dailyIncome: "", deliveryType: "Food Delivery" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await api.registerRider(form);
    setLoading(false);
    if (res.error) return setError(res.error);
    onRegistered(res);
  };

  return (
    <div className="screen">
      <div className="card register-card">
        <h2>🛵 Create Rider Account</h2>
        <form onSubmit={submit}>
          <label>Name</label>
          <input name="name" placeholder="Ravi Kumar" value={form.name} onChange={handle} required />
          <label>Phone</label>
          <input name="phone" placeholder="9876543210" value={form.phone} onChange={handle} required />
          <label>City</label>
          <select name="city" value={form.city} onChange={handle}>
            {["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <label>Delivery Platform</label>
          <select name="platform" value={form.platform} onChange={handle}>
            {["Swiggy", "Zomato", "Blinkit", "Zepto", "Dunzo"].map((p) => <option key={p}>{p}</option>)}
          </select>
          <label>Average Daily Income (₹)</label>
          <input name="dailyIncome" type="number" placeholder="500" value={form.dailyIncome} onChange={handle} required />
          <label>Delivery Type</label>
          <select name="deliveryType" value={form.deliveryType} onChange={handle}>
            {["Food Delivery", "Grocery", "Package", "Medicine"].map((t) => <option key={t}>{t}</option>)}
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        </form>
      </div>
    </div>
  );
}
