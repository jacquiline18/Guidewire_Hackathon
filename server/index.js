require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/insurintel")
  .then(() => console.log("✅ MongoDB connected — insurintel database"))
  .catch(e => console.error("❌ MongoDB connection failed:", e.message));

// ─── Schemas ───────────────────────────────────────────────────────────────────
const RiderSchema = new mongoose.Schema({
  riderId: { type: String, unique: true },
  name: String, phone: { type: String, unique: true },
  city: String, platform: String,
  dailyIncome: Number, deliveryType: String,
  status: String, wallet: { type: Number, default: 0 },
  riskScore: mongoose.Schema.Types.Mixed,
  registeredAt: String,
});

const PolicySchema = new mongoose.Schema({
  policyId: String, riderId: String, planId: String,
  weeklyPremium: Number, maxCompensation: Number,
  status: String, startDate: String, endDate: String,
  paymentMethod: String, txnId: String,
});

const TransactionSchema = new mongoose.Schema({
  txnId: String, riderId: String, type: String,
  amount: Number, description: String, date: String,
});

const ClaimSchema = new mongoose.Schema({
  claimId: String, riderId: String, riderName: String,
  eventType: String, city: String, weatherData: mongoose.Schema.Types.Mixed,
  dailyIncome: Number, compensation: Number,
  fraudChecks: mongoose.Schema.Types.Mixed, allChecksPassed: Boolean,
  decision: String, decisionReason: String,
  trustScore: mongoose.Schema.Types.Mixed,
  status: String, createdAt: String,
});

const Rider       = mongoose.model("Rider",       RiderSchema);
const Policy      = mongoose.model("Policy",      PolicySchema);
const Transaction = mongoose.model("Transaction", TransactionSchema);
const Claim       = mongoose.model("Claim",       ClaimSchema);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function shortId(prefix) { return prefix + Math.floor(1000 + Math.random() * 9000); }

// ─── RF Classifier ─────────────────────────────────────────────────────────────
function rfClassify({ rainfall, temperature, windspeed, aqi }) {
  const d = [];
  if (rainfall > 80)    d.push("Heavy Rain");
  if (temperature > 42) d.push("Extreme Heat");
  if (windspeed > 60)   d.push("Strong Winds");
  if (aqi > 200)        d.push("Severe Pollution");
  return d;
}

// ─── Risk Score ────────────────────────────────────────────────────────────────
async function calcRisk(rider) {
  const cityRisk     = { Chennai:85, Mumbai:80, Hyderabad:60, Delhi:65, Bangalore:40 };
  const deliveryRisk = { "Food Delivery":70, Grocery:65, Package:55, Medicine:60 };
  const weatherRisk  = { Chennai:80, Mumbai:75, Hyderabad:55, Delhi:60, Bangalore:35 };
  const pastClaims   = await Claim.countDocuments({ riderId: rider.riderId });
  const income       = Number(rider.dailyIncome);

  const cs = cityRisk[rider.city]||50;
  const is = income<=300?90:income<=500?70:income<=800?50:30;
  const cl = pastClaims===0?20:pastClaims<=2?45:pastClaims<=5?65:85;
  const ds = deliveryRisk[rider.deliveryType]||60;
  const ws = weatherRisk[rider.city]||50;
  const raw = cs*0.30+is*0.20+cl*0.20+ds*0.15+ws*0.15;
  const score = Math.min(100,Math.max(1,Math.round(raw+(Math.random()*10-5))));
  const level = score>=70?"HIGH":score>=40?"MEDIUM":"LOW";
  return {
    score, level,
    premiumMultiplier: score>=70?1.5:score>=40?1.0:0.8,
    breakdown:{
      cityRisk:{score:cs,weight:"30%",label:"City Weather Risk"},
      incomeRisk:{score:is,weight:"20%",label:"Income Vulnerability"},
      claimsRisk:{score:cl,weight:"20%",label:"Past Claims History"},
      deliveryRisk:{score:ds,weight:"15%",label:"Delivery Type Exposure"},
      weatherRisk:{score:ws,weight:"15%",label:"Seasonal Weather Risk"},
    },
    recommendation: score>=70?"High risk profile. Premium plan recommended."
      :score>=40?"Moderate risk. Basic plan provides adequate coverage."
      :"Low risk profile. Basic plan is sufficient.",
  };
}

// ─── Trust Score ───────────────────────────────────────────────────────────────
async function calcTrust(riderId) {
  const claims      = await Claim.find({ riderId });
  const total       = claims.length;
  const approved    = claims.filter(c=>c.status==="APPROVED").length;
  const today       = new Date().toDateString();
  const todayCount  = claims.filter(c=>new Date(c.createdAt).toDateString()===today).length;
  let score = 100, flags = [];
  if (total>5)      { score-=20; flags.push("High claim frequency"); }
  else if(total>3)  { score-=10; flags.push("Moderate claim frequency"); }
  if (total>0&&approved===total) score+=5;
  if (todayCount>1) { score-=30; flags.push("Multiple claims in one day"); }
  score = Math.min(100,Math.max(0,score));
  return { score, level:score>=80?"TRUSTED":score>=50?"MODERATE":"FLAGGED", flags };
}

// ─── Fraud Checks ──────────────────────────────────────────────────────────────
async function fraudChecks(rider, city, eventType) {
  const policy = await Policy.findOne({ riderId:rider.riderId, status:"ACTIVE" });
  const today  = new Date().toDateString();
  const dup    = await Claim.findOne({ riderId:rider.riderId, eventType, $where:`new Date(this.createdAt).toDateString()==='${today}'` });
  const trust  = await calcTrust(rider.riderId);
  const checks = {
    hasActivePolicy:{ passed:!!policy,                                    label:"Active insurance policy",           detail:policy?`Policy ${policy.policyId} active`:"No active policy found" },
    locationMatch:  { passed:rider.city.toLowerCase()===city.toLowerCase(),label:"Rider city matches disruption",    detail:`Rider:${rider.city} | Event:${city}` },
    noDuplicate:    { passed:!dup,                                         label:"No duplicate claim today",         detail:dup?`Duplicate ${dup.claimId} found`:"No duplicate detected" },
    trustScore:     { passed:trust.score>=50,                              label:"Trust score threshold met",        detail:`Trust:${trust.score}/100 (${trust.level})`, score:trust.score, level:trust.level },
  };
  return { checks, allPassed:Object.values(checks).every(c=>c.passed) };
}

// ─── ROUTES ────────────────────────────────────────────────────────────────────

// Lookup rider by phone — always returns JSON, never 404
app.get("/api/riders/by-phone/:phone", async (req, res) => {
  try {
    const rider = await Rider.findOne({ phone: req.params.phone }).lean();
    if (!rider) return res.json({ found: false });
    res.json({ found: true, ...rider });
  } catch { res.json({ found: false }); }
});

// Policy status
app.get("/api/riders/:riderId/policy-status", async (req, res) => {
  try {
    const premiums = await Transaction.find({ riderId:req.params.riderId, type:"PREMIUM" }).sort({ date:-1 });
    if (!premiums.length) return res.json({ hasPolicy:false, lastPaidDate:null });
    const pol = await Policy.findOne({ riderId:req.params.riderId }).sort({ _id:-1 });
    res.json({ hasPolicy:true, lastPaidDate:premiums[0].date, planId:pol?.planId||"basic" });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// OTP stubs
app.post("/api/otp/send",   (req, res) => res.json({ success:true }));
app.post("/api/otp/verify", (req, res) => res.json({ success:true }));

// RF detect
app.post("/api/weather/detect", (req, res) => {
  const { city, rainfall, temperature, windspeed, aqi } = req.body;
  res.json({ disruptions: rfClassify({ rainfall:+rainfall, temperature:+temperature, windspeed:+windspeed, aqi:+aqi }), city });
});

// Register rider
app.post("/api/riders/register", async (req, res) => {
  try {
    const { name, phone, city, platform, dailyIncome, deliveryType } = req.body;
    if (!name||!phone||!city||!dailyIncome) return res.status(400).json({ error:"Missing required fields" });

    // Return existing rider if phone already registered
    const existing = await Rider.findOne({ phone }).lean();
    if (existing) return res.json(existing);

    const riderId = shortId("RID");
    const rider   = new Rider({ riderId, name, phone, city, platform, dailyIncome:+dailyIncome, deliveryType, status:"Registered", wallet:0, registeredAt:new Date().toISOString() });
    rider.riskScore = await calcRisk(rider);
    await rider.save();
    res.json(rider.toObject());
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Risk score
app.get("/api/riders/:riderId/risk", async (req, res) => {
  try {
    const rider = await Rider.findOne({ riderId:req.params.riderId });
    if (!rider) return res.status(404).json({ error:"Rider not found" });
    const riskScore = await calcRisk(rider);
    rider.riskScore = riskScore;
    await rider.save();
    res.json(riskScore);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Insurance plan
app.get("/api/insurance/plan", (req, res) => {
  res.json({ name:"InsurIntel Weekly Income Protection", coverage:["Heavy Rain","Extreme Heat","Strong Winds","Severe Pollution"], weeklyPremium:30, durationDays:7 });
});

// Buy policy
app.post("/api/insurance/buy", async (req, res) => {
  try {
    const { riderId, paymentMethod, planId } = req.body;
    const rider = await Rider.findOne({ riderId });
    if (!rider) return res.status(404).json({ error:"Rider not found" });

    // Expire existing active policy
    await Policy.updateMany({ riderId, status:"ACTIVE" }, { status:"EXPIRED" });

    const isPremium = planId==="premium";
    const weeklyPremium = isPremium?60:30;
    const maxCompensation = isPremium?1000:500;
    const txnId = shortId("TXN");
    const startDate = new Date();
    const endDate = new Date(startDate); endDate.setDate(endDate.getDate()+7);

    const policy = await Policy.create({ policyId:shortId("POL"), riderId, planId:planId||"basic", weeklyPremium, maxCompensation, status:"ACTIVE", startDate:startDate.toISOString(), endDate:endDate.toISOString(), paymentMethod, txnId });
    await Transaction.create({ txnId, riderId, type:"PREMIUM", amount:-weeklyPremium, description:`${isPremium?"Premium":"Basic"} Plan — Weekly Premium`, date:new Date().toISOString() });
    res.json({ ...policy.toObject(), message:"Payment Successful" });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Dashboard
app.get("/api/riders/:riderId/dashboard", async (req, res) => {
  try {
    const rider = await Rider.findOne({ riderId:req.params.riderId }).lean();
    if (!rider) return res.status(404).json({ error:"Rider not found" });
    const policy       = await Policy.findOne({ riderId:rider.riderId, status:"ACTIVE" }).lean();
    const transactions = await Transaction.find({ riderId:rider.riderId }).sort({ date:-1 }).limit(10).lean();
    const claims       = await Claim.find({ riderId:rider.riderId }).lean();
    const trustScore   = await calcTrust(rider.riderId);
    res.json({ rider, policy:policy||null, transactions, claims, trustScore });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Simulate weather + claim pipeline
app.post("/api/weather/simulate", async (req, res) => {
  try {
    const { city, rainfall, temperature, windspeed, aqi } = req.body;
    const event = { city, rainfall:+rainfall, temperature:+temperature, windspeed:+(windspeed||0), aqi:+aqi, timestamp:new Date().toISOString() };
    const disruptions = rfClassify(event);
    if (!disruptions.length) return res.json({ message:"No disruption detected", event, disruptions:[] });

    const eventType      = disruptions[0];
    const affectedRiders = await Rider.find({ city:{ $regex:new RegExp(`^${city}$`,"i") } }).lean();
    const generatedClaims=[], rejectedClaims=[];

    for (const rider of affectedRiders) {
      const premiums = await Transaction.find({ riderId:rider.riderId, type:"PREMIUM" }).sort({ date:1 });
      const daysSince = premiums.length ? (Date.now()-new Date(premiums[premiums.length-1].date).getTime())/(1000*60*60*24) : Infinity;

      if (daysSince>7) {
        const blocked = await Claim.create({ claimId:shortId("CLM"), riderId:rider.riderId, riderName:rider.name, eventType, city, weatherData:event, dailyIncome:rider.dailyIncome, compensation:0, fraudChecks:{}, allChecksPassed:false, decision:"REJECTED", decisionReason:`Policy expired. ${Math.floor(daysSince)} days since last payment. Please renew.`, trustScore:await calcTrust(rider.riderId), status:"REJECTED", createdAt:new Date().toISOString() });
        rejectedClaims.push(blocked); continue;
      }

      const policy   = await Policy.findOne({ riderId:rider.riderId, status:"ACTIVE" }).lean();
      const rawComp  = policy?Math.min(rider.dailyIncome,policy.maxCompensation):0;
      const fraud    = await fraudChecks(rider, city, eventType);
      const decision = fraud.allPassed
        ? { decision:"APPROVED", reason:"All fraud checks passed. Compensation authorised.", compensation:rawComp }
        : { decision:"REJECTED", reason:`Failed: ${Object.entries(fraud.checks).filter(([,v])=>!v.passed).map(([,v])=>v.label).join(", ")}`, compensation:0 };

      const claim = await Claim.create({ claimId:shortId("CLM"), riderId:rider.riderId, riderName:rider.name, eventType, city, weatherData:event, dailyIncome:rider.dailyIncome, compensation:decision.compensation, fraudChecks:fraud.checks, allChecksPassed:fraud.allPassed, decision:decision.decision, decisionReason:decision.reason, trustScore:await calcTrust(rider.riderId), status:decision.decision, createdAt:new Date().toISOString() });

      if (decision.decision==="APPROVED") {
        await Rider.updateOne({ riderId:rider.riderId }, { $inc:{ wallet:decision.compensation } });
        await Transaction.create({ txnId:shortId("PAY"), riderId:rider.riderId, type:"PAYOUT", amount:decision.compensation, description:`${eventType} Compensation`, date:new Date().toISOString() });
        generatedClaims.push(claim);
      } else { rejectedClaims.push(claim); }
    }
    res.json({ disruptions, event, generatedClaims, rejectedClaims });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Admin dashboard
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const today    = new Date().toDateString();
    const riders   = await Rider.find().lean();
    const policies = await Policy.find().lean();
    const claims   = await Claim.find().lean();
    const txns     = await Transaction.find().lean();
    const totalPaid = txns.filter(t=>t.type==="PAYOUT").reduce((s,t)=>s+t.amount,0);
    const cities   = ["Chennai","Bangalore","Hyderabad","Mumbai","Delhi"];
    res.json({
      totalRiders: riders.length,
      activePolicies: policies.filter(p=>p.status==="ACTIVE").length,
      disruptionsToday: 0,
      totalClaims: claims.length,
      approvedClaims: claims.filter(c=>c.status==="APPROVED").length,
      rejectedClaims: claims.filter(c=>c.status==="REJECTED").length,
      totalCompensationPaid: totalPaid,
      riskZones: cities.map(c=>({ city:c, risk:"Low" })),
      recentClaims: claims.slice(-5).reverse(),
      riders: riders,
    });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get("/api/admin/riders", async (req, res) => {
  const riders = await Rider.find().lean();
  res.json(riders);
});

// Clear all data (dev utility)
app.delete("/api/dev/reset", async (req, res) => {
  await Promise.all([Rider.deleteMany({}), Policy.deleteMany({}), Transaction.deleteMany({}), Claim.deleteMany({})]);
  res.json({ message:"All data cleared" });
});

app.listen(5000, () => console.log("✅ InsurIntel server on http://localhost:5000"));
