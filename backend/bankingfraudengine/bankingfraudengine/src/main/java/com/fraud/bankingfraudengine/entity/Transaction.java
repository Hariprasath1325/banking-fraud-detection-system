package com.fraud.bankingfraudengine.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transaction")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    private String senderAccountNumber;
    private String receiverAccountNumber;

    private double amount;
    private LocalDateTime timestamp;

    private String status;
    private double fraudScore;
    private String fraudStatus;

    @Column(length = 1000)
    private String message;

    // ===============================
    // FRAUD CONTEXT FEATURES
    // ===============================

    private String merchantCategory;
    private int foreignTransaction;
    private int locationMismatch;
    private double deviceTrustScore;
    private double velocityLast24h;
    private int cardholderAge;

    // ===============================
    // SIMULATION FIELDS
    // ===============================

    private boolean isSimulated = false;
    private boolean isFlagged = false;

    // NEW FIELD (for accuracy evaluation)
    private String simulationType;

    // ===============================
    // PIN (Input Only - Not Stored)
    // ===============================

    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty(
            access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY
    )
    private String pin;

    public Transaction() {}

    // ===============================
    // GETTERS AND SETTERS
    // ===============================

    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public String getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(String senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }

    public String getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(String receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getFraudScore() { return fraudScore; }
    public void setFraudScore(double fraudScore) { this.fraudScore = fraudScore; }

    public String getFraudStatus() { return fraudStatus; }
    public void setFraudStatus(String fraudStatus) { this.fraudStatus = fraudStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getMerchantCategory() { return merchantCategory; }
    public void setMerchantCategory(String merchantCategory) { this.merchantCategory = merchantCategory; }

    public int getForeignTransaction() { return foreignTransaction; }
    public void setForeignTransaction(int foreignTransaction) { this.foreignTransaction = foreignTransaction; }

    public int getLocationMismatch() { return locationMismatch; }
    public void setLocationMismatch(int locationMismatch) { this.locationMismatch = locationMismatch; }

    public double getDeviceTrustScore() { return deviceTrustScore; }
    public void setDeviceTrustScore(double deviceTrustScore) { this.deviceTrustScore = deviceTrustScore; }

    public double getVelocityLast24h() { return velocityLast24h; }
    public void setVelocityLast24h(double velocityLast24h) { this.velocityLast24h = velocityLast24h; }

    public int getCardholderAge() { return cardholderAge; }
    public void setCardholderAge(int cardholderAge) { this.cardholderAge = cardholderAge; }

    public boolean isSimulated() { return isSimulated; }
    public void setSimulated(boolean simulated) { isSimulated = simulated; }

    public boolean isFlagged() { return isFlagged; }
    public void setFlagged(boolean flagged) { isFlagged = flagged; }

    public String getSimulationType() { return simulationType; }
    public void setSimulationType(String simulationType) { this.simulationType = simulationType; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
}