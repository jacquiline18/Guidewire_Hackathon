const BASE = "http://localhost:5000/api";

export const api = {
  registerRider: (data) => fetch(`${BASE}/riders/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  getPlan: () => fetch(`${BASE}/insurance/plan`).then((r) => r.json()),
  buyPolicy: (data) => fetch(`${BASE}/insurance/buy`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  getDashboard: (riderId) => fetch(`${BASE}/riders/${riderId}/dashboard`).then((r) => r.json()),
  simulateWeather: (data) => fetch(`${BASE}/weather/simulate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  getAdminDashboard: () => fetch(`${BASE}/admin/dashboard`).then((r) => r.json()),
  getAllRiders: () => fetch(`${BASE}/admin/riders`).then((r) => r.json()),
};
