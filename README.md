Project Title

InsurIntel AI – Intelligent Parametric Insurance Platform

This project proposes an AI‑powered insurance platform designed for gig workers such as delivery riders who depend on daily income. External conditions like heavy rain, extreme heat, or severe pollution may stop riders from working, causing loss of earnings. Traditional insurance systems are slow and require manual verification, making them unsuitable for gig workers.

Our solution is a parametric insurance platform that automatically detects disruptions using weather data and rider activity. The system verifies whether the rider has active insurance and automatically approves or rejects the claim using AI‑based decision logic. This makes the claim process fast, fair, and resistant to fraud.

The platform is implemented as a web application prototype using React, with simulated backend logic and machine learning decision flow.
Persona Based Scenario
Persona 1 — Delivery Rider

Ravi is a delivery rider working daily to earn money. He buys weekly insurance using the app. One day, heavy rain starts and he cannot complete deliveries. The system detects heavy rain using weather data and checks his insurance validity. Since his insurance is active, the claim is approved automatically and compensation is added to his dashboard.
Persona 2 — Rider without insurance

John tries to claim compensation during extreme heat, but his weekly insurance expired two days ago. The system checks the stored date, detects that the insurance is inactive, and rejects the claim automatically.
Persona 3 — Fraud attempt

A rider tries to create multiple accounts using the same name and phone number. The fraud detection logic detects duplicate registration and marks the account as suspicious. Future claims from this account are rejected.
Application Workflow

   Rider logs in using mobile number and OTP verification.

   Rider activates weekly insurance.

   System stores insurance activation date.

   Application fetches weather data from API.

   AI decision engine evaluates risk.

   Rider triggers claim.

   System checks:

   Insurance active

   Weather disruption valid

   Fraud detection

   Risk score

  Claim approved or rejected.

   Dashboard updated.

This workflow demonstrates a fully automated parametric insurance system.
Weekly Premium Model

The system uses a weekly micro‑insurance model. Riders pay a small premium to activate insurance for seven days. The date and time of activation are stored in the system.

Whenever a claim is triggered, the system compares the current date with the stored date. If more than seven days have passed, the claim is rejected automatically.

This model is suitable for gig workers because their income is daily and unpredictable, so short‑term insurance provides flexibility.

Premium amount can be adjusted based on risk score predicted by the AI model.
Parametric Triggers

Parametric triggers are conditions that automatically allow a claim without manual verification.

In this project, triggers include:

   Heavy Rain detected from weather API

   Extreme Heat detected from temperature data

   Severe Pollution detected from air quality index

   Insurance must be active

   Rider must not be flagged as fraud

The system checks these conditions automatically using decision logic. If all conditions are satisfied, the claim is approved instantly.

This makes the system fast and reliable.
Platform Choice — Web Application

We chose a web platform for the prototype because it is easier to develop, test, and demonstrate during the hackathon. React was used to build the frontend interface with animations and dynamic dashboard.

The architecture is designed so that the system can later be converted into a mobile application without changing the backend logic. This makes the design flexible for future implementation.
AI / ML Integration Plan

The system is designed to use machine learning for risk prediction, fraud detection, and premium calculation. The main model planned for this project is Random Forest.

Random Forest consists of multiple decision trees. Each tree analyzes input data such as weather condition, rider history, number of claims, and insurance status. Each tree produces a prediction, and the final result is obtained using majority voting.

Random Forest will be used for:

   Risk assessment (low, medium, high)

   Fraud detection (valid or suspicious)

   Premium calculation

   Claim validation

In the Phase‑1 prototype, the predictions are simulated using rule‑based logic, but the architecture supports real machine learning integration.
Future AI Improvement — Gradient Boosting

In future implementation, the system can be improved using Gradient Boosting. This algorithm builds decision trees sequentially, where each new tree corrects the errors of the previous one. Gradient Boosting can provide higher accuracy than Random Forest.

This will allow more precise fraud detection, better premium calculation, and more accurate risk prediction based on long‑term rider behavior and seasonal weather patterns.

The current system architecture is designed so that Gradient Boosting can be added without changing the frontend.
Tech Stack

Frontend:

 React, CSS & Animations
The frontend of the application is developed using React, which is a JavaScript library used for building dynamic user interfaces. React is used to create the login page, dashboard, insurance activation screen, claim trigger page, and risk score display. The component‑based architecture of React allows the interface to update automatically when the rider activates insurance, triggers a claim, or when the risk score changes.

CSS is used to design the layout, colors, and styling of the application. Animations and transitions are added to improve user experience, such as sliding pages, background changes, and smooth navigation between screens. These animations help demonstrate the workflow clearly during the prototype presentation.

The frontend collects rider inputs such as login details, insurance activation, and claim request, and sends this data to the backend logic where the decision process happens.

Backend :
Node / Flask
In the current Phase‑1 prototype, most of the logic is simulated in the frontend, but the real system is designed to use a backend server. The backend can be implemented using Node.js or Flask.

The backend is responsible for processing data, checking insurance validity, fetching weather data, and running the AI decision logic. When the rider triggers a claim, the frontend sends the request to the backend. The backend then checks the stored insurance date, retrieves weather data from API, and sends all inputs to the AI model.

Flask is suitable for machine learning integration because Python libraries such as scikit‑learn can run easily in Flask. Node.js can also be used for handling API requests and database operations. In future implementation, the backend will act as the decision engine of the system.

Database :

MongoDB / JSON
The system needs to store rider information, insurance activation date, claim history, and fraud flags. In the prototype, this data is simulated using JSON objects, but in a real system it will be stored in a database.

MongoDB is suitable because it stores data in flexible JSON format, which matches the structure of rider records. Each rider can have fields such as name, phone number, insurance date, claims count, risk score, and fraud status.

When the rider logs in, the system retrieves data from the database. When insurance is activated, the date is saved. When a claim is triggered, the system reads the stored data to decide whether the rider is eligible.

Using a database ensures that the AI model can access past records to make accurate predictions.

API:
 Weather API
The system uses a weather API to fetch real‑time environmental data. This API provides information such as temperature, rainfall level, and pollution index for a specific location. The rider’s location can be taken from GPS or simulated location in the prototype.

This weather data is used as input for the AI decision model. Instead of allowing the rider to manually select the disruption, the system checks actual weather conditions. If the API reports heavy rain, extreme heat, or severe pollution, the system marks the situation as a valid disruption.

Using API data makes the system more reliable and prevents fake claims, because the decision is based on real environmental conditions.

AI Model :

   Random Forest
The main AI model planned for this project is Random Forest. Random Forest is a machine learning algorithm that consists of multiple decision trees. Each decision tree analyzes input data and produces a prediction, and the final result is obtained using majority voting.

In this system, Random Forest will use inputs such as weather condition, number of claims, insurance validity, rider history, and location. Each decision tree checks different conditions, and the final result determines the risk score, fraud status, and claim approval.

For example, one tree may check weather severity, another may check claim frequency, and another may check whether insurance is active. If most trees predict high risk, the system shows high risk score. If most trees detect fraud, the claim is rejected.

 Gradient Boosting (future)
 In future implementation, the system can be improved using Gradient Boosting. Gradient Boosting is another machine learning algorithm that builds decision trees one by one. Each new tree learns from the mistakes of the previous tree, making the prediction more accurate.

Gradient Boosting is useful when the decision depends on complex patterns. In this project, it can be used to improve fraud detection, calculate premium more precisely, and predict risk based on long‑term rider behavior.

For example, the model can learn seasonal weather patterns, rider claim frequency over time, and location‑based risk. This makes the insurance system smarter and more reliable.

The current architecture is designed so that Gradient Boosting can replace or work together with Random Forest without changing the frontend.

 Python sklearn
 The AI models such as Random Forest and Gradient Boosting can be implemented using Python with the scikit‑learn library. Scikit‑learn provides ready‑to‑use algorithms for training and prediction.

In the future system, the backend will send rider data and weather data to the Python model. The model will process the input and return the prediction result, such as risk score or fraud status. The backend will then send this result to the frontend dashboard.

Using Python and scikit‑learn makes the system flexible and suitable for real machine learning deployment.

Authentication:

   OTP login simulation

Development Plan

Phase 1:

   Idea design

   Workflow design

   UI prototype

   Simulated AI logic

   Dashboard

Phase 2:

   Backend integration

   Real weather API

   Database storage

   Real ML model

Phase 3:

   Gradient Boosting model

   Mobile app

   Cloud deployment

   Real payment system


To support this, the frontend must be changed, mobile sensors must be used, and AI models must work with live data.
Frontend for Mobile App

Instead of React web, the mobile app can be built using:

    React Native (best if already using React)

    Flutter

    Android Studio (Java/Kotlin)

Recommended for your project:

    React Native, because your current app is already in React.

How it helps:

    Same UI logic can be reused

    Works on Android phones

    Supports animations and dashboard

    Can access GPS and mobile sensors

In mobile version, screens will include:

    Registration screen

    Login with OTP

    Insurance activation

    Dashboard

    Claim trigger

    Risk score display

    Fraud alert screen

Mobile Features Needed for This Project

Mobile app allows features that web cannot do easily.
GPS Location Tracking

Used for:

    Checking rider location

    Preventing fake claims

    Matching weather with location

Tools:

    React Native Location API

    Google Maps API

    GPS sensor

Example use in project:

System checks:

Rider location = Chennai
Weather API = Heavy rain in Chennai
→ Claim valid

If location mismatch:

Rider location = Delhi
Weather = Chennai rain
→ Fraud detected

Real‑Time Weather Detection

Mobile app can fetch weather automatically.

Tools:

    OpenWeather API

    Weather API

    REST API calls

Used for:

    Extreme heat detection

    Heavy rain detection

    Pollution detection

This data goes to AI model.
Mobile OTP Login

Needed for fraud prevention.

Tools:

    Firebase Authentication

    Twilio OTP

    SMS API

Used for:

    One account per rider

    No fake users

    Secure login

Flow:

Register → phone → OTP → verified → account created
Login → OTP → dashboard

AI Tools Needed for Mobile Version

The AI model does not run directly in mobile UI.
It runs in backend / server.

Tools needed:
Python

Used to run AI model.

Why:

    Machine learning libraries available

    Easy backend integration

Scikit‑learn

Used for:

    Random Forest

    Gradient Boosting

Used in project for:

    Risk score prediction

    Fraud detection

    Premium calculation

    Claim validation

Example:

Input:

weather = rain
claims = 3
insurance = active
location = match

Output:

risk = high
claim = valid
fraud = no

Flask / FastAPI Backend

Mobile app sends data to backend.

Backend does:

    Receive data

    Fetch weather

    Check database

    Run AI model

    Send result

Tools:

    Flask

    FastAPI

    Node.js (optional)

MongoDB Database

Stores:

    Rider info

    Insurance date

    Claim history

    Fraud flag

    Risk score

Mobile app reads / writes to database through backend.
How Mobile AI Workflow Will Work

Full flow in mobile version:

    Rider registers in mobile app

    OTP verification

    Rider buys weekly insurance

    Date stored in database

    App reads GPS location

    App fetches weather API

    Data sent to backend

    Random Forest predicts risk

    Rider triggers claim

    Backend checks:

    insurance active

    weather valid

    no fraud

    risk score

    Claim approved / rejected

    Result shown in mobile dashboard

This makes the system fully automatic.
Future AI Improvement for Mobile

Future version will use:

    Gradient Boosting

    Deep Learning

    Real-time analytics

Possible upgrades:

    Predict risk before rider starts work

    Suggest safe working hours

    Adjust premium automatically

    Detect fraud patterns over time

This makes the mobile insurance system intelligent.
Conclusion – Mobile Version Upgrade

Converting the system into a mobile app will allow real‑time data collection, better fraud detection, and automatic claim validation. Using React Native, GPS API, Weather API, Python backend, and machine learning models like Random Forest and Gradient Boosting, the platform can become a fully intelligent parametric insurance system suitable for real‑world gig workers.

InsurIntel AI demonstrates a smart parametric insurance platform for gig workers using AI‑based decision logic, automated disruption detection, and weekly micro‑insurance. The system is designed to be scalable and ready for future machine learning integration.

The Phase‑1 prototype successfully shows the idea, workflow, AI plan, and architecture required for a real‑world intelligent insurance system.
Mobile App Version – How the System Will Be Modified

In the current Phase‑1 prototype, the application is built as a web platform using React.
For future implementation, the system can be converted into a mobile application so that delivery riders can access insurance services directly from their phones while working.

A mobile application is more suitable because gig workers always carry their phones, and the system needs access to real‑time location, weather data, and activity status. The mobile version will allow automatic detection of disruptions, better fraud prevention, and real‑time claim validation.


<img width="1024" height="1536" alt="flowchart" src="https://github.com/user-attachments/assets/6d563ed0-41ce-418b-afe3-36a8c5788f99" />

