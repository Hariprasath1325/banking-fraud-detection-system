# Digital Banking Fraud Detection & Simulation Engine

## Project Overview

The **Digital Banking Fraud Detection & Simulation Engine** is a full-stack system designed to simulate banking transactions and detect fraudulent activities in real time. The system combines **rule-based fraud detection** and **machine learning techniques** to analyze transactions and identify suspicious behavior.

This project demonstrates how modern banking systems can monitor transactions, calculate fraud risk scores, and alert administrators when potentially fraudulent activity occurs.

---

## System Architecture

User / Admin
↓
Frontend (React.js)
↓
Backend API (Spring Boot)
↓
Fraud Detection Engine (Rule Engine + ML Model)
↓
MySQL Database

---

## Key Features

### Transaction Simulation

* Generates realistic banking transactions.
* Simulates **SAFE, MEDIUM, and HIGH risk transactions**.
* Includes noise generation to mimic real-world banking data.

### Fraud Detection Engine

* Hybrid fraud detection approach:

  * Rule-based fraud detection
  * Machine learning fraud prediction
* Calculates a **fraud score for every transaction**.

### Fraud Risk Classification

Fraud Score Classification:

| Fraud Score | Risk Level  |
| ----------- | ----------- |
| < 40        | Low Risk    |
| 40 – 69     | Medium Risk |
| ≥ 70        | High Risk   |

### Machine Learning Detection

ML model predicts fraud probability:

| Probability | Category               |
| ----------- | ---------------------- |
| ≥ 0.7       | High Fraud Probability |
| 0.4 – 0.69  | Medium Risk            |
| < 0.4       | Safe Transaction       |

### Real-Time Fraud Alerts

* Suspicious transactions are flagged automatically.
* High-risk transactions are highlighted for admin review.

### Analytics Dashboard

The system provides analytics including:

* Fraud rate
* Precision
* Recall
* Binary accuracy
* Confusion matrix

Current system performance:

Binary Accuracy ≈ 90%
Precision ≈ 100%
Recall ≈ 84%

### Admin Security

* JWT-based authentication
* Secure admin APIs
* Protected analytics endpoints

---

## Technology Stack

### Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* REST API

### Frontend

* React.js
* Axios
* HTML
* CSS
* JavaScript

### Machine Learning

* Python
* Scikit-learn

### Database

* MySQL

### Tools & Platforms

* IntelliJ IDEA
* VS Code
* Git & GitHub
* MySQL Workbench

---

## Project Structure

banking-fraud-detection-system
│
├── backend
│   ├── src
│   ├── pom.xml
│
├── frontend
│   ├── src
│   ├── package.json
│
├── ml-model
│   ├── fraud_model.py
│
├── .gitignore
└── README.md

---

## Backend Features

* Transaction simulation engine
* Fraud detection rule engine
* ML fraud probability integration
* Transaction storage and retrieval
* Fraud analytics APIs
* Secure admin login using JWT

---

## Frontend Features

* Transaction monitoring interface
* Fraud detection dashboard
* Fraud risk indicators
* Analytics visualization
* Admin login and authentication
* Real-time transaction display

---

## Fraud Detection Logic

Fraud detection works using a hybrid model combining **rule-based scoring and machine learning prediction**.

Example logic:

Rule-Based Risk Score + ML Fraud Probability → Final Fraud Score

The system analyzes:

* Transaction amount
* Transaction frequency
* Behavioral patterns
* Suspicious activity indicators

---

## How to Run the Project

### 1 Backend Setup

Navigate to backend folder:

cd backend

Run the Spring Boot application:

mvn spring-boot:run

Backend runs at:

http://localhost:8080

---

### 2 Frontend Setup

Navigate to frontend folder:

cd frontend

Install dependencies:

npm install

Run frontend:

npm start

Frontend runs at:

http://localhost:3000

---

### 3 Database Setup

Install MySQL and create database:

CREATE DATABASE fraud_detection;

Update database credentials inside:

application.properties

---

## Future Enhancements

* Real-time transaction streaming using Kafka
* Advanced AI-based anomaly detection
* Advanced fraud analytics dashboard

---

## Learning Outcomes

This project helped in understanding:

* Full-stack development using Java and React
* Banking fraud detection systems
* Hybrid rule-based + ML detection models
* REST API development
* Secure authentication with JWT
* Database integration using MySQL
* Fraud analytics and monitoring

---

## Author

Hariprasath B

---

## License

This project is created for **educational and research purposes**.
