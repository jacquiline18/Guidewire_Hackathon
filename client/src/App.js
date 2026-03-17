import { useState } from "react";
import Register from "./screens/Register";
import InsurancePlan from "./screens/InsurancePlan";
import Payment from "./screens/Payment";
import Dashboard from "./screens/Dashboard";
import WeatherSimulator from "./screens/WeatherSimulator";
import AdminDashboard from "./screens/AdminDashboard";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("register");
  const [rider, setRider] = useState(null);
  const [plan, setPlan] = useState(null);

  const nav = (s) => setScreen(s);

  return (
    <div className="app">
      <nav className="navbar">
        <span className="logo">⚡ InsurIntel</span>
        <div className="nav-links">
          {rider && <button className="nav-btn" onClick={() => nav("dashboard")}>Dashboard</button>}
          <button className="nav-btn admin-btn" onClick={() => nav("admin")}>Admin</button>
        </div>
      </nav>

      {screen === "register" && (
        <Register onRegistered={(r) => { setRider(r); nav("plan"); }} />
      )}
      {screen === "plan" && rider && (
        <InsurancePlan rider={rider} onBuy={(p) => { setPlan(p); nav("payment"); }} />
      )}
      {screen === "payment" && rider && plan && (
        <Payment rider={rider} plan={plan} onSuccess={() => nav("dashboard")} />
      )}
      {screen === "dashboard" && rider && (
        <Dashboard rider={rider} onSimulate={() => nav("weather")} />
      )}
      {screen === "weather" && rider && (
        <WeatherSimulator rider={rider} onDone={() => nav("dashboard")} />
      )}
      {screen === "admin" && (
        <AdminDashboard onBack={() => nav(rider ? "dashboard" : "register")} />
      )}
    </div>
  );
}
