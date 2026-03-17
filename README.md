# InsurIntel AI – Intelligent Parametric Insurance Platform

Smart Insurance for Gig Workers using AI, Real-Time Data, and Automated Claims

InsurIntel AI is a Phase-1 prototype of an AI-powered parametric insurance system designed to protect gig delivery workers from income loss caused by external disruptions such as heavy rain, floods, extreme weather, pollution alerts, or service outages.

The system detects disruptions using real-time or simulated data, verifies rider location, performs fraud checks, and automatically processes claims.

This project was built for Hackathon 2026.

--------------------------------------------------

## Problem Statement

Gig workers such as delivery riders depend on daily income.

During situations like:

- Heavy rain
- Floods
- Extreme heat
- Pollution alerts
- App outages
- Road restrictions

they cannot work and lose earnings.

Currently, there is no automatic insurance system that protects their income without manual claim requests.

InsurIntel AI solves this problem using an automated parametric insurance model.

--------------------------------------------------

## Solution

InsurIntel AI provides:

- Weekly income protection insurance
- Weather-based disruption detection
- GPS location verification
- Automated claim approval
- Fraud detection validation
- Predictive disruption alerts

The system ensures that compensation is given only when a real disruption affects an insured rider.

--------------------------------------------------

## Key Features

### 1. Rider Registration

Rider enters:

- Name
- City
- Daily income

Account is created in the system.

---

### 2. Weekly Insurance Plan

Rider can activate a weekly coverage plan.

Example:

Premium: ₹30 / week  
Coverage: ₹500 per disruption

Insurance must be active before the event.

---

### 3. Predictive Weather Alert

The system checks weather forecast and warns rider.

Example alert:

Heavy rain expected tomorrow.
Activate insurance to stay protected.

This helps rider buy insurance before disruption.

---

### 4. Weather Trigger Detection

The system monitors weather data using API or simulation.

Triggers include:

- Rain
- Flood
- Heatwave
- Pollution alert

When trigger occurs, event is stored.

---

### 5. GPS Location Verification

Before claim approval, the system checks rider location.

Prototype uses simulated location.

Real system will use:

- Mobile GPS
- Browser location API
- Delivery platform data

Claim allowed only if rider is in affected area.

---

### 6. Automated Claim Processing

If disruption occurs and rider is insured:

- System verifies insurance
- Checks location
- Confirms weather trigger
- Generates claim automatically

No manual claim required.

---

### 7. Fraud Detection

The system prevents fake claims using rules:

- Insurance Active Check
- Location Mismatch Check
- Duplicate Claim Check

Claim rejected if any rule fails.

---

### 8. Wallet / Payout Simulation

Approved claims are added to rider wallet.

Example:

Wallet credited: ₹500

In real system this will connect to payment gateway.

--------------------------------------------------

## Fraud Detection Logic

Insurance Active Check  
Ensures rider bought insurance before disruption.

Location Mismatch Check  
Validates rider location with disruption city.

Duplicate Claim Check  
Prevents multiple claims for same event.

Weather Verification Check  
Confirms real-time disruption before payout.

--------------------------------------------------

## How the App Works

1. Rider registers
2. Rider buys weekly insurance
3. System monitors weather API
4. Disruption detected
5. Rider location verified
6. Fraud checks performed
7. Claim generated automatically
8. Wallet credited

--------------------------------------------------

## Tech Stack

Frontend
- HTML
- CSS
- JavaScript

Backend
- Python
- Flask

API
- Weather API (OpenWeather or simulated)

Storage
- JSON / Local database

Tools
- VS Code
- GitHub

--------------------------------------------------

## Prototype Limitations (Phase-1)

This project is a Phase-1 prototype built to demonstrate the core logic of an automated parametric insurance system.

Some features are simulated for demonstration purposes but the system is designed to support real-time integration.

### Simulated GPS Location

Location is selected manually in the prototype.

Future version will use real GPS tracking.

### Simulated Weather Trigger

Weather events may be triggered manually for demo.

Future version will use live weather APIs.

### Simulated Insurance Payment

Insurance activation is shown without real payment.

Future version will include payment gateway.

### Simulated Payout

Wallet credit is simulated.

Future version will connect to banking / insurance system.

### Purpose of Prototype

The goal of Phase-1 is to demonstrate:

- Automated claim logic
- Fraud detection
- Weather trigger validation
- Insurance workflow

Real integration can be added later.

--------------------------------------------------

## Future Improvements

- Real GPS tracking
- Real weather APIs
- Payment gateway
- Insurance provider integration
- Machine learning risk prediction
- Mobile app version

--------------------------------------------------

## Team
Team Name: SynaptiX
Project: InsurIntel AI
Hackathon: 2026

--------------------------------------------------
