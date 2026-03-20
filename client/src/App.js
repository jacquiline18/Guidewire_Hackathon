import { useState } from "react";
import Login from "./screens/Login";
import PolicyStatus from "./screens/PolicyStatus";
import Register from "./screens/Register";
import RiskScore from "./screens/RiskScore";
import Payment from "./screens/Payment";
import Dashboard from "./screens/Dashboard";
import WeatherSimulator from "./screens/WeatherSimulator";
import AdminDashboard from "./screens/AdminDashboard";
import "./App.css";

export default function App() {
  const [screen, setScreen]           = useState("login");
  const [rider, setRider]             = useState(null);
  const [plan, setPlan]               = useState(null);
  const [claimBlocked, setClaimBlocked] = useState(false);

  const nav = (s) => setScreen(s);

  // Called by Login after OTP verified
  // riderOrNull: existing rider object, or null for new rider
  const handleVerified = (riderOrNull) => {
    if (riderOrNull) {
      setRider(riderOrNull);
      nav("policyStatus");       // existing rider → show policy status screen
    } else {
      nav("register");           // new rider → register flow
    }
  };

  // Called by PolicyStatus "Enter Dashboard" button
  const handleEnterDashboard = (r, blocked) => {
    setRider(r);
    setClaimBlocked(blocked);
    nav("dashboard");
  };

  // Called by PolicyStatus "Pay Now / Renew" button
  const handlePayNow = (r, planId = "basic") => {
    setRider(r);
    setPlan(
      planId === "premium"
        ? { id: "premium", name: "Premium", emoji: "⭐", weeklyPremium: 60, maxCompensation: 1000 }
        : { id: "basic",   name: "Basic",   emoji: "🛡️", weeklyPremium: 30, maxCompensation: 500  }
    );
    nav("payment");
  };

  return (
    <div className="app">
      {screen !== "login" && screen !== "register" && screen !== "policyStatus" && (
        <nav className="navbar">
          <span className="logo">🛡️ InsurIntel</span>
          <div className="nav-links">
            {rider && <button className="nav-btn" onClick={() => nav("dashboard")}>Dashboard</button>}
            <button className="nav-btn admin-btn" onClick={() => nav("admin")}>Admin</button>
            <button className="nav-btn" style={{ background: "transparent", color: "#666", border: "1.5px solid #e5e7eb" }}
              onClick={() => { setRider(null); setClaimBlocked(false); nav("login"); }}>
              Logout
            </button>
          </div>
        </nav>
      )}

      {screen === "login" && (
        <Login onVerified={handleVerified} onRegister={() => nav("register")} />
      )}

      {screen === "policyStatus" && rider && (
        <PolicyStatus
          rider={rider}
          onEnterDashboard={handleEnterDashboard}
          onPayNow={handlePayNow}
        />
      )}

      {screen === "register" && (
        <Register
          onRegistered={(r) => {
            setRider(r);
            setPlan(r.selectedPlan || null);
            nav("risk");
          }}
        />
      )}

      {screen === "risk" && rider && (
        <RiskScore rider={rider} onContinue={() => nav("payment")} />
      )}

      {screen === "payment" && rider && plan && (
        <Payment rider={rider} plan={plan} onSuccess={() => nav("dashboard")} />
      )}

      {screen === "dashboard" && rider && (
        <Dashboard rider={rider} claimBlocked={claimBlocked} onSimulate={() => nav("weather")} />
      )}

      {screen === "weather" && rider && (
        <WeatherSimulator rider={rider} onDone={() => nav("dashboard")} />
      )}

      {screen === "admin" && (
        <AdminDashboard onBack={() => nav(rider ? "dashboard" : "login")} />
      )}
    </div>
  );
}
