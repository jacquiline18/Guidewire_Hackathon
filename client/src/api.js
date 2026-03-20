const BASE = "http://localhost:5000/api";

export const api = {
  registerRider: (data) =>
    fetch(`${BASE}/riders/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),

  getRiskScore: (riderId) =>
    fetch(`${BASE}/riders/${riderId}/risk`).then((r) => r.json()),

  getPlan: () =>
    fetch(`${BASE}/insurance/plan`).then((r) => r.json()),

  buyPolicy: (data) =>
    fetch(`${BASE}/insurance/buy`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),

  getDashboard: (riderId) =>
    fetch(`${BASE}/riders/${riderId}/dashboard`).then((r) => r.json()),

  simulateWeather: (data) =>
    fetch(`${BASE}/weather/simulate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),

  getAdminDashboard: () =>
    fetch(`${BASE}/admin/dashboard`).then((r) => r.json()),

  getAllRiders: () =>
    fetch(`${BASE}/admin/riders`).then((r) => r.json()),

  getRiderByPhone: (phone) =>
    fetch(`${BASE}/riders/by-phone/${phone}`)
      .then((r) => r.json())
      .catch(() => ({ found: false })),

  getPolicyStatus: (riderId) =>
    fetch(`${BASE}/riders/${riderId}/policy-status`).then((r) => r.json()),

  sendOtp: (phone) =>
    fetch(`${BASE}/otp/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) }).then((r) => r.json()),

  verifyOtp: (phone, code) =>
    fetch(`${BASE}/otp/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code }) }).then((r) => r.json()),

  detectWeather: (data) =>
    fetch(`${BASE}/weather/detect`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),

  devReset: () =>
    fetch(`${BASE}/dev/reset`, { method: "DELETE" }).then((r) => r.json()),
};
