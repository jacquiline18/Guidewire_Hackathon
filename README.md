 InsurIntel AI – Intelligent Insurance Platform for Riders

Introduction

InsurIntel AI is an intelligent insurance platform designed for gig workers such as delivery riders.
Delivery partners often lose their daily income due to external disruptions like heavy rain, floods, extreme heat, or pollution alerts.
This project provides a weekly micro-insurance system that automatically compensates riders when such disruptions happen.


Problem Statement

Riders depend on daily earnings.
During bad weather or city disruptions, they cannot work and lose income.

Current platforms do not provide automatic protection.

Our system solves this by:

* Weekly insurance plan
* Automatic disruption detection
* Location verification
* Fraud prevention
* AI risk scoring
* Automatic claim generation


3. Platform Choice

We selected a web-based platform using React.

Reason:

* Easy to develop prototype
* Supports GPS and API integration
* Suitable for demo and testing
* Can be converted to mobile app later


 4. Persona Scenario

Example Rider:

Name: Arun
City: Chennai
Platform: Zomato
Daily Income: ₹500

Scenario:

1. Rider registers in the app
2. Rider buys weekly insurance
3. Heavy rain occurs
4. System checks weather and location
5. Insurance active → claim generated
6. Compensation added to wallet


---

5. Application Workflow

1. Rider Registration
2. Risk Score Calculation
3. Weekly Insurance Purchase
4. Insurance Activation
5. Disruption Detection
6. Location Validation
7. Fraud Detection
8. Trust Score Check
9. Decision Engine
10. Claim Generation
11. Wallet Compensation
    



## 6. Rider Registration

Rider enters:

* Name
* Phone number
* City
* Delivery platform
* Daily income
* Delivery type

This data is used to calculate risk.

---

 7. AI Risk Calculation

The system calculates a risk score using AI.

Factors:

* City risk
* Income
* Past claims
* Delivery type
* Weather risk

Prototype Model:
Random Forest

Future Model:
Gradient Boosting / XGBoost

Risk score helps decide:

* Premium
* Coverage
* Fraud probability

---

8. Weekly Insurance Model

Example plan:

Premium: ₹30 per week
Coverage: ₹700
Duration: 7 days

Coverage for:

* Heavy rain
* Flood
* Heat wave
* Pollution

Payment is simulated in prototype.

---

9. Insurance Activation

After payment:

* Insurance becomes active
* Start date stored
* End date stored
* Rider eligible for claims

---

10. Disruption Detection

The system checks for weather disruptions.

Prototype:

Simulated weather trigger

Future:

* OpenWeather API
* WeatherAPI

Triggers:

* Rain
* Flood
* Heat
* Pollution

---
 11. Location Validation

Before claim:

* GPS checked
* City match checked
* Disruption area checked

Prototype:

Simulated location

Future:

* Browser GPS
* Google Maps API

---

## 12. Fraud Detection System

To prevent fake claims, multiple checks are used.

Fraud Detection Pipeline:

Location Validation
↓
Device Fingerprinting
↓
Behavior Analysis
↓
Cluster Detection
↓
Trust Score Evaluation
↓
Decision Engine
↓
Approve / Flag / Reject

---

13. Device Fingerprinting

Checks:

* device info
* login pattern
* session data

Prevents:

* fake accounts
* account sharing

Future:

* OTP
* 2FA

---

14. Behavior Analysis

Checks:

* claim frequency
* login activity
* past usage

Suspicious behavior reduces trust score.

---

15. Cluster Detection

Used to detect fraud rings.

System monitors:

* same GPS clusters
* same IP address
* same claim timing
* similar behavior

If many accounts look same → flagged.

---

 16. Trust Score

Each rider has a trust score.

Based on:

* past claims
* device match
* location match
* AI risk score
* behavior history

High trust → approve
Medium → flag
Low → reject

---

17. Decision Engine

Final check uses:

* AI score
* fraud checks
* trust score
* weather validation

Result:

Approve
Flag
Reject

---

18. Claim Generation

If valid:

* claim created automatically
* no manual form

Example:

Rain detected
Insurance active
Location valid
Trust score good

→ Claim approved

---

 19. Wallet Compensation

After approval:

* amount added to wallet

Prototype:

Simulated payout

Future:

* real payment
* bank transfer
* UPI

---

20. Adversarial Defense & Anti-Spoofing Strategy

To prevent market crash from fake claims, system uses multi-layer defense.

Possible attack:

* fake GPS
* many accounts
* same location
* same IP
* mass claims

Defense steps:

Location check
Device check
Behavior check
Cluster detection
Trust score
Decision engine

Goal:

* stop fraud rings
* allow real riders
* protect insurance pool

---

21. Technology Stack

Frontend:
React, CSS, JavaScript

Backend:
Node / Flask (simulation)

Storage:
Local / JSON

API future:
Weather API
GPS API
Maps API

AI:
Random Forest (prototype)
Gradient Boosting (future)

Tools:
VS Code
GitHub

---

 22. Development Plan

Phase 1:
Idea, workflow, prototype, security design

Phase 2:
Real APIs, database, AI model

Phase 3:
Full system, mobile app, real payment

---
 23. Prototype Note

This is Phase-1 prototype.

Simulated:

* weather
* GPS
* payment
* AI
* payout

---
 24. Conclusion

InsurIntel AI provides a secure insurance system using:

* weekly micro insurance
* AI risk scoring
* fraud detection
* anti-spoofing defense
* automatic claims




