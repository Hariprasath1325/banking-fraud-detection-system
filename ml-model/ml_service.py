from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from dateutil import parser

app = Flask(__name__)

# Load model and column order
model = joblib.load("professional_fraud_model.pkl")
model_columns = joblib.load("model_columns.pkl")

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    amount = float(data.get("amount", 0))
    timestamp = data.get("timestamp")
    location_mismatch = int(data.get("locationMismatch", 0))
    foreign_transaction = int(data.get("foreignTransaction", 0))
    velocity_last_24h = float(data.get("velocityLast24h", 0))

    # Convert timestamp → hour
    if timestamp:
        dt = parser.parse(timestamp)
        transaction_hour = dt.hour
    else:
        transaction_hour = 0

    # Simulated values
    device_trust_score = np.random.uniform(0.3, 1.0)
    cardholder_age = np.random.randint(18, 65)

    # Default merchant category (can improve later)
    merchant_category = "electronics"

    # Create base dictionary
    input_data = {
        "amount": amount,
        "transaction_hour": transaction_hour,
        "foreign_transaction": foreign_transaction,
        "location_mismatch": location_mismatch,
        "device_trust_score": device_trust_score,
        "velocity_last_24h": velocity_last_24h,
        "cardholder_age": cardholder_age,
        "merchant_category": merchant_category
    }

    # Convert to dataframe
    input_df = pd.DataFrame([input_data])

    # Feature engineering (must match training)

    input_df["high_amount_flag"] = (input_df["amount"] >= 50000).astype(int)
    input_df["very_high_amount_flag"] = (input_df["amount"] >= 150000).astype(int)

    input_df["night_transaction_flag"] = (
        (input_df["transaction_hour"] >= 1) &
        (input_df["transaction_hour"] <= 5)
    ).astype(int)

    input_df["high_velocity_flag"] = (
        input_df["velocity_last_24h"] >= 5
    ).astype(int)

    input_df["low_device_trust_flag"] = (
        input_df["device_trust_score"] <= 0.3
    ).astype(int)

    input_df["risk_interaction"] = (
        input_df["high_amount_flag"] *
        input_df["foreign_transaction"] *
        input_df["location_mismatch"]
    )

    # Apply same encoding as training
    input_df = pd.get_dummies(input_df)

    # Add missing columns
    for col in model_columns:
        if col not in input_df:
            input_df[col] = 0

    input_df = input_df[model_columns]

    probability = model.predict_proba(input_df)[0][1]

    if probability >= 0.7:
        prediction = 1
    elif probability >= 0.4:
        prediction = 2  # medium risk
    else:
        prediction = 0

    return jsonify({
        "fraudProbability": round(float(probability), 4),
        "riskLevel": (
            "HIGH_RISK" if probability >= 0.7
            else "MEDIUM_RISK" if probability >= 0.4
            else "SAFE"
        )
    })

if __name__ == "__main__":
    app.run(port=5000)