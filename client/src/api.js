// ─── InsurIntel Mock API ───────────────────────────────────────────────────────
// Full in-browser simulation using localStorage. No backend required.
// Used for the Netlify static demo.

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ── Storage helpers ────────────────────────────────────────────────────────────
const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const getAll  = (k)    => store.get(k);
const saveAll = (k, v) => store.set(k, v);
const findOne = (k, fn) => getAll(k).find(fn) || null;
const insert  = (k, doc) => { const all = getAll(k); all.push(doc); saveAll(k, all); return doc; };
const updateWhere = (k, fn, patch) => {
  const all = getAll(k).map(d => fn(d) ? { ...d, ...patch } : d);
  saveAll(k, all); return all;
};

// ── ID generator ───────────────────────────────────────────────────────────────
const shortId = (p) => p + Math.floor(1000 + Math.random() * 9000);

// ── RF Classifier ──────────────────────────────────────────────────────────────
function rfClassify({ rainfall, temperature, windspeed, aqi }) {
  const d = [];
  if (+rainfall    > 80)  d.push("Heavy Rain");
  if (+temperature > 42)  d.push("Extreme Heat");
  if (+windspeed   > 60)  d.push("Strong Winds");
  if (+aqi         > 200) d.push("Severe Pollution");
  return d;
}

// ── Risk calculation (mirrors server logic) ────────────────────────────────────
function calcRiskSync({ city, dailyIncome, deliveryType, riderId }) {
  const cityRisk     = { Chennai:85, Mumbai:80, Hyderabad:60, Delhi:65, Bangalore:40 };
  const deliveryRisk = { "Food Delivery":70, Grocery:65, Package:55, Medicine:60 };
  const weatherRisk  = { Chennai:80, Mumbai:75, Hyderabad:55, Delhi:60, Bangalore:35 };
  const claims       = getAll("claims").filter(c => c.riderId === riderId);
  const income       = +dailyIncome;
  const cs = cityRisk[city]    || 50;
  const is = income<=300?90:income<=500?70:income<=800?50:30;
  const cl = claims.length===0?20:claims.length<=2?45:claims.length<=5?65:85;
  const ds = deliveryRisk[deliveryType] || 60;
  const ws = weatherRisk[city] || 50;
  const raw   = cs*0.30 + is*0.20 + cl*0.20 + ds*0.15 + ws*0.15;
  const score = Math.min(100, Math.max(1, Math.round(raw)));
  const level = score>=70?"HIGH":score>=40?"MEDIUM":"LOW";
  const multiplier = score>=70?1.5:score>=40?1.0:0.8;
  return {
    score, level, multiplier,
    premiumMultiplier: multiplier,
    breakdown: {
      cityRisk:     { score:cs, weight:"30%", label:"City Weather Risk" },
      incomeRisk:   { score:is, weight:"20%", label:"Income Vulnerability" },
      claimsRisk:   { score:cl, weight:"20%", label:"Past Claims History" },
      deliveryRisk: { score:ds, weight:"15%", label:"Delivery Type Exposure" },
      weatherRisk:  { score:ws, weight:"15%", label:"Seasonal Weather Risk" },
    },
    recommendation: score>=70?"High risk profile. Premium plan recommended."
      :score>=40?"Moderate risk. Basic plan provides adequate coverage."
      :"Low risk profile. Basic plan is sufficient.",
  };
}

// ── Trust score ────────────────────────────────────────────────────────────────
function calcTrustSync(riderId) {
  const claims     = getAll("claims").filter(c => c.riderId === riderId);
  const total      = claims.length;
  const approved   = claims.filter(c => c.status === "APPROVED").length;
  const today      = new Date().toDateString();
  const todayCount = claims.filter(c => new Date(c.createdAt).toDateString() === today).length;
  let score = 100, flags = [];
  if (total > 5)     { score -= 20; flags.push("High claim frequency"); }
  else if (total > 3){ score -= 10; flags.push("Moderate claim frequency"); }
  if (total > 0 && approved === total) score += 5;
  if (todayCount > 1){ score -= 30; flags.push("Multiple claims in one day"); }
  score = Math.min(100, Math.max(0, score));
  return { score, level: score>=80?"TRUSTED":score>=50?"MODERATE":"FLAGGED", flags };
}

// ── Fraud checks ───────────────────────────────────────────────────────────────
function fraudChecksSync(rider, city, eventType) {
  const policy   = findOne("policies", p => p.riderId === rider.riderId && p.status === "ACTIVE");
  const today    = new Date().toDateString();
  const dup      = getAll("claims").find(c =>
    c.riderId === rider.riderId && c.eventType === eventType &&
    new Date(c.createdAt).toDateString() === today
  );
  const trust = calcTrustSync(rider.riderId);
  const checks = {
    hasActivePolicy: { passed: !!policy,                                      label: "Active insurance policy",        detail: policy ? `Policy ${policy.policyId} active` : "No active policy found" },
    locationMatch:   { passed: rider.city.toLowerCase()===city.toLowerCase(), label: "Rider city matches disruption",  detail: `Rider:${rider.city} | Event:${city}` },
    noDuplicate:     { passed: !dup,                                           label: "No duplicate claim today",       detail: dup ? `Duplicate ${dup.claimId} found` : "No duplicate detected" },
    trustScore:      { passed: trust.score >= 50,                              label: "Trust score threshold met",      detail: `Trust:${trust.score}/100 (${trust.level})`, score: trust.score, level: trust.level },
  };
  return { checks, allPassed: Object.values(checks).every(c => c.passed) };
}

// ══════════════════════════════════════════════════════════════════════════════
// MOCK API — same interface as the real api.js
// ══════════════════════════════════════════════════════════════════════════════
export const api = {

  // OTP — always succeeds (demo)
  sendOtp:   async () => { await delay(300); return { success: true }; },
  verifyOtp: async () => { await delay(200); return { success: true }; },

  // Lookup rider by phone
  getRiderByPhone: async (phone) => {
    await delay(300);
    const rider = findOne("riders", r => r.phone === phone);
    if (!rider) return { found: false };
    return { found: true, ...rider };
  },

  // Register rider
  registerRider: async (data) => {
    await delay(500);
    const existing = findOne("riders", r => r.phone === data.phone);
    if (existing) return existing;
    const riderId = shortId("RID");
    const risk    = calcRiskSync({ ...data, riderId });
    const rider   = {
      riderId, name: data.name, phone: data.phone, city: data.city,
      platform: data.platform, dailyIncome: +data.dailyIncome,
      deliveryType: data.deliveryType, status: "Registered",
      wallet: 0, riskScore: risk, registeredAt: new Date().toISOString(),
    };
    insert("riders", rider);
    return rider;
  },

  // Risk score
  getRiskScore: async (riderId) => {
    await delay(2000); // simulate AI processing time
    const rider = findOne("riders", r => r.riderId === riderId);
    if (!rider) return { error: "Rider not found" };
    const risk = calcRiskSync(rider);
    updateWhere("riders", r => r.riderId === riderId, { riskScore: risk });
    return risk;
  },

  // Risk preview (before registration — no DB write)
  getRiskPreview: async (data) => {
    await delay(600);
    const risk = calcRiskSync({ ...data, riderId: "__preview__" });
    const basicPremium   = Math.round(30 * risk.multiplier);
    const premiumPremium = Math.round(60 * risk.multiplier);
    return {
      ...risk,
      plans: [
        { id:"basic",   name:"Basic",   emoji:"🛡️", weeklyPremium:basicPremium,   maxCompensation:500,  coverage:["Heavy Rain","Extreme Heat"],                              tag:"Most Popular",  color:"#2d9e5f", bg:"#eafaf1", border:"#c8ead8" },
        { id:"premium", name:"Premium", emoji:"⭐", weeklyPremium:premiumPremium, maxCompensation:1000, coverage:["Heavy Rain","Extreme Heat","High Pollution","Cyclone Alert"], tag:"Best Coverage", color:"#6c3fc5", bg:"#f3eeff", border:"#d8c8f5" },
      ],
    };
  },

  // Policy status
  getPolicyStatus: async (riderId) => {
    await delay(300);
    const premiums = getAll("transactions")
      .filter(t => t.riderId === riderId && t.type === "PREMIUM")
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!premiums.length) return { hasPolicy: false, lastPaidDate: null };
    const pol = getAll("policies").filter(p => p.riderId === riderId).slice(-1)[0];
    return { hasPolicy: true, lastPaidDate: premiums[0].date, planId: pol?.planId || "basic" };
  },

  // Buy policy
  buyPolicy: async (data) => {
    await delay(600);
    const rider = findOne("riders", r => r.riderId === data.riderId);
    if (!rider) return { error: "Rider not found" };
    updateWhere("policies", p => p.riderId === data.riderId && p.status === "ACTIVE", { status: "EXPIRED" });
    const risk         = calcRiskSync(rider);
    const isPremium    = data.planId === "premium";
    const weeklyPremium = Math.round((isPremium ? 60 : 30) * risk.premiumMultiplier);
    const maxCompensation = isPremium ? 1000 : 500;
    const txnId    = shortId("TXN");
    const startDate = new Date().toISOString();
    const endDate   = new Date(Date.now() + 7*24*60*60*1000).toISOString();
    const policy = insert("policies", {
      policyId: shortId("POL"), riderId: data.riderId, planId: data.planId || "basic",
      weeklyPremium, maxCompensation, status: "ACTIVE",
      startDate, endDate, paymentMethod: data.paymentMethod, txnId,
    });
    insert("transactions", {
      txnId, riderId: data.riderId, type: "PREMIUM",
      amount: -weeklyPremium,
      description: `${isPremium?"Premium":"Basic"} Plan — Weekly Premium (Risk: ${risk.level})`,
      date: new Date().toISOString(),
    });
    return { ...policy, message: "Payment Successful", riskLevel: risk.level };
  },

  // Dashboard
  getDashboard: async (riderId) => {
    await delay(400);
    const rider        = findOne("riders", r => r.riderId === riderId);
    if (!rider) return { error: "Rider not found" };
    const policy       = findOne("policies", p => p.riderId === riderId && p.status === "ACTIVE");
    const transactions = getAll("transactions").filter(t => t.riderId === riderId).sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,10);
    const claims       = getAll("claims").filter(c => c.riderId === riderId);
    const trustScore   = calcTrustSync(riderId);
    return { rider, policy: policy || null, transactions, claims, trustScore };
  },

  // RF weather detect
  detectWeather: async (data) => {
    await delay(200);
    return { disruptions: rfClassify(data), city: data.city };
  },

  // Simulate weather + claim pipeline
  simulateWeather: async (data) => {
    await delay(800);
    const { city, rainfall, temperature, windspeed, aqi } = data;
    const event = { city, rainfall:+rainfall, temperature:+temperature, windspeed:+(windspeed||0), aqi:+aqi, timestamp: new Date().toISOString() };
    const disruptions = rfClassify(event);
    if (!disruptions.length) return { message: "No disruption detected", event, disruptions: [] };

    const eventType      = disruptions[0];
    const affectedRiders = getAll("riders").filter(r => r.city.toLowerCase() === city.toLowerCase());
    const generatedClaims = [], rejectedClaims = [];

    for (const rider of affectedRiders) {
      const premiums  = getAll("transactions").filter(t => t.riderId === rider.riderId && t.type === "PREMIUM").sort((a,b) => new Date(a.date)-new Date(b.date));
      const daysSince = premiums.length ? (Date.now() - new Date(premiums[premiums.length-1].date).getTime()) / (1000*60*60*24) : Infinity;

      if (daysSince > 7) {
        const blocked = insert("claims", {
          claimId: shortId("CLM"), riderId: rider.riderId, riderName: rider.name,
          eventType, city, weatherData: event, dailyIncome: rider.dailyIncome,
          compensation: 0, fraudChecks: {}, allChecksPassed: false,
          decision: "REJECTED", decisionReason: `Policy expired. ${Math.floor(daysSince)} days since last payment. Please renew.`,
          trustScore: calcTrustSync(rider.riderId), status: "REJECTED", createdAt: new Date().toISOString(),
        });
        rejectedClaims.push(blocked); continue;
      }

      const policy  = findOne("policies", p => p.riderId === rider.riderId && p.status === "ACTIVE");
      const rawComp = policy ? Math.min(rider.dailyIncome, policy.maxCompensation) : 0;
      const fraud   = fraudChecksSync(rider, city, eventType);
      const decision = fraud.allPassed
        ? { decision: "APPROVED", reason: "All fraud checks passed. Compensation authorised.", compensation: rawComp }
        : { decision: "REJECTED", reason: `Failed: ${Object.entries(fraud.checks).filter(([,v])=>!v.passed).map(([,v])=>v.label).join(", ")}`, compensation: 0 };

      const claim = insert("claims", {
        claimId: shortId("CLM"), riderId: rider.riderId, riderName: rider.name,
        eventType, city, weatherData: event, dailyIncome: rider.dailyIncome,
        compensation: decision.compensation, fraudChecks: fraud.checks,
        allChecksPassed: fraud.allPassed, decision: decision.decision,
        decisionReason: decision.reason, trustScore: calcTrustSync(rider.riderId),
        status: decision.decision, createdAt: new Date().toISOString(),
      });

      if (decision.decision === "APPROVED") {
        updateWhere("riders", r => r.riderId === rider.riderId, { wallet: (rider.wallet || 0) + decision.compensation });
        insert("transactions", {
          txnId: shortId("PAY"), riderId: rider.riderId, type: "PAYOUT",
          amount: decision.compensation, description: `${eventType} Compensation`,
          date: new Date().toISOString(),
        });
        generatedClaims.push(claim);
      } else {
        rejectedClaims.push(claim);
      }
    }
    return { disruptions, event, generatedClaims, rejectedClaims };
  },

  // Admin dashboard
  getAdminDashboard: async () => {
    await delay(400);
    const riders   = getAll("riders");
    const policies = getAll("policies");
    const claims   = getAll("claims");
    const txns     = getAll("transactions");
    const totalPaid = txns.filter(t => t.type === "PAYOUT").reduce((s,t) => s + t.amount, 0);
    const cities   = ["Chennai","Bangalore","Hyderabad","Mumbai","Delhi"];
    return {
      totalRiders: riders.length,
      activePolicies: policies.filter(p => p.status === "ACTIVE").length,
      disruptionsToday: 0,
      totalClaims: claims.length,
      approvedClaims: claims.filter(c => c.status === "APPROVED").length,
      rejectedClaims: claims.filter(c => c.status === "REJECTED").length,
      totalCompensationPaid: totalPaid,
      riskZones: cities.map(c => ({ city: c, risk: "Low" })),
      recentClaims: claims.slice(-5).reverse(),
      riders,
    };
  },

  getAllRiders: async () => { await delay(200); return getAll("riders"); },

  getPlan: async () => {
    await delay(200);
    return { name: "InsurIntel Weekly Income Protection", coverage: ["Heavy Rain","Extreme Heat","Strong Winds","Severe Pollution"], weeklyPremium: 30, durationDays: 7 };
  },

  devReset: async () => {
    ["riders","policies","transactions","claims"].forEach(k => localStorage.removeItem(k));
    return { message: "All data cleared" };
  },
};
