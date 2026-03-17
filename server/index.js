const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// --- In-memory store ---
const db = {
  riders: [],
  policies: [],
  claims: [],
  transactions: [],
  weatherEvents: [],
};

// --- Helpers ---
function shortId(prefix) {
  return prefix + Math.floor(1000 + Math.random() * 9000);
}

function getRider(riderId) {
  return db.riders.find((r) => r.riderId === riderId);
}

function getPolicy(riderId) {
  return db.policies.find((p) => p.riderId === riderId && p.status === "ACTIVE");
}

// ─── Rider Registration ───────────────────────────────────────────────────────
app.post("/api/riders/register", (req, res) => {
  const { name, phone, city, platform, dailyIncome, deliveryType } = req.body;
  if (!name || !phone || !city || !dailyIncome)
    return res.status(400).json({ error: "Missing required fields" });

  const riderId = shortId("RID");
  const rider = { riderId, name, phone, city, platform, dailyIncome: Number(dailyIncome), deliveryType, status: "Registered", wallet: 0 };
  db.riders.push(rider);
  res.json(rider);
});

// ─── Insurance Plan ───────────────────────────────────────────────────────────
app.get("/api/insurance/plan", (req, res) => {
  res.json({
    name: "GigSuraksha Weekly Income Protection",
    coverage: ["Heavy Rain", "Extreme Heat", "High Pollution"],
    maxWeeklyCompensation: 700,
    weeklyPremium: 30,
    durationDays: 7,
  });
});

// ─── Buy Policy ───────────────────────────────────────────────────────────────
app.post("/api/insurance/buy", (req, res) => {
  const { riderId, paymentMethod } = req.body;
  const rider = getRider(riderId);
  if (!rider) return res.status(404).json({ error: "Rider not found" });

  const existing = getPolicy(riderId);
  if (existing) return res.status(400).json({ error: "Active policy already exists" });

  const txnId = shortId("TXN");
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const policy = {
    policyId: shortId("POL"),
    riderId,
    weeklyPremium: 30,
    maxCompensation: 700,
    status: "ACTIVE",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    paymentMethod,
    txnId,
  };
  db.policies.push(policy);

  db.transactions.push({
    txnId,
    riderId,
    type: "PREMIUM",
    amount: -30,
    description: "Weekly Premium Payment",
    date: new Date().toISOString(),
  });

  res.json({ ...policy, message: "Payment Successful" });
});

// ─── Rider Dashboard ──────────────────────────────────────────────────────────
app.get("/api/riders/:riderId/dashboard", (req, res) => {
  const rider = getRider(req.params.riderId);
  if (!rider) return res.status(404).json({ error: "Rider not found" });

  const policy = getPolicy(rider.riderId);
  const transactions = db.transactions.filter((t) => t.riderId === rider.riderId).slice(-10).reverse();
  const claims = db.claims.filter((c) => c.riderId === rider.riderId);

  res.json({ rider, policy: policy || null, transactions, claims });
});

// ─── Weather Simulation ───────────────────────────────────────────────────────
app.post("/api/weather/simulate", (req, res) => {
  const { city, rainfall, temperature, aqi } = req.body;

  const event = { city, rainfall: Number(rainfall), temperature: Number(temperature), aqi: Number(aqi), timestamp: new Date().toISOString() };
  db.weatherEvents.push(event);

  const disruptions = [];
  if (event.rainfall > 80) disruptions.push("Heavy Rain");
  if (event.temperature > 42) disruptions.push("Extreme Heat");
  if (event.aqi > 200) disruptions.push("High Pollution");

  if (disruptions.length === 0) return res.json({ message: "No disruption detected", event });

  // Auto-generate claims for all active riders in that city
  const affectedRiders = db.riders.filter((r) => r.city.toLowerCase() === city.toLowerCase());
  const generatedClaims = [];

  for (const rider of affectedRiders) {
    const policy = getPolicy(rider.riderId);
    if (!policy) continue;

    const alreadyClaimed = db.claims.find(
      (c) => c.riderId === rider.riderId && c.eventType === disruptions[0] &&
        new Date(c.createdAt).toDateString() === new Date().toDateString()
    );
    if (alreadyClaimed) continue;

    const compensation = Math.min(rider.dailyIncome, policy.maxCompensation);
    const claimId = shortId("CLM");

    const claim = {
      claimId,
      riderId: rider.riderId,
      riderName: rider.name,
      eventType: disruptions[0],
      city,
      weatherData: event,
      dailyIncome: rider.dailyIncome,
      compensation,
      fraudChecks: { locationVerified: true, noDuplicate: true, riderActive: true },
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    };
    db.claims.push(claim);

    // Credit wallet
    rider.wallet += compensation;
    const payId = shortId("PAY");
    db.transactions.push({
      txnId: payId,
      riderId: rider.riderId,
      type: "PAYOUT",
      amount: compensation,
      description: `${disruptions[0]} Compensation`,
      date: new Date().toISOString(),
    });

    generatedClaims.push(claim);
  }

  res.json({ disruptions, event, generatedClaims });
});

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
app.get("/api/admin/dashboard", (req, res) => {
  const today = new Date().toDateString();
  const todayDisruptions = db.weatherEvents.filter((e) => new Date(e.timestamp).toDateString() === today);
  const totalPaid = db.transactions.filter((t) => t.type === "PAYOUT").reduce((s, t) => s + t.amount, 0);

  const riskZones = ["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi"].map((city) => {
    const events = db.weatherEvents.filter((e) => e.city === city);
    const lastEvent = events[events.length - 1];
    let risk = "Low";
    if (lastEvent) {
      if (lastEvent.rainfall > 80 || lastEvent.aqi > 200) risk = "High";
      else if (lastEvent.rainfall > 40 || lastEvent.temperature > 38) risk = "Medium";
    }
    return { city, risk };
  });

  res.json({
    totalRiders: db.riders.length,
    activePolicies: db.policies.filter((p) => p.status === "ACTIVE").length,
    disruptionsToday: todayDisruptions.length,
    totalClaims: db.claims.length,
    totalCompensationPaid: totalPaid,
    riskZones,
    recentClaims: db.claims.slice(-5).reverse(),
  });
});

// ─── Get all riders (admin) ───────────────────────────────────────────────────
app.get("/api/admin/riders", (req, res) => res.json(db.riders));

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
