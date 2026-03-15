package com.fraud.bankingfraudengine.detection;

import com.fraud.bankingfraudengine.dto.MLRequest;
import com.fraud.bankingfraudengine.dto.MLResponse;
import com.fraud.bankingfraudengine.entity.Alert;
import com.fraud.bankingfraudengine.entity.Transaction;
import com.fraud.bankingfraudengine.repository.AlertRepository;
import com.fraud.bankingfraudengine.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class FraudDetectionService {

    private final AlertRepository alertRepository;
    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${fraud.high-amount-threshold}")
    private double highAmountThreshold;

    private static final Set<String> BLACKLISTED = new HashSet<>();

    static {
        BLACKLISTED.add("BLK1001");
    }

    public FraudDetectionService(AlertRepository alertRepository,
                                 TransactionRepository transactionRepository) {
        this.alertRepository = alertRepository;
        this.transactionRepository = transactionRepository;
    }

    public void evaluateTransaction(Transaction transaction) {

        double ruleScore = 0;
        StringBuilder message = new StringBuilder();

        // RULE 1 — HIGH AMOUNT

        if (transaction.getAmount() >= highAmountThreshold) {
            ruleScore += 50;
            message.append("High amount detected (≥ ")
                    .append(highAmountThreshold)
                    .append("). ");
        }

        // RULE 2 — BLACKLIST

        if (BLACKLISTED.contains(transaction.getReceiverAccountNumber())) {
            ruleScore += 40;
            message.append("Receiver is blacklisted. ");
        }

        // RULE 3 — RAPID TRANSACTION

        LocalDateTime twoMinutesAgo = LocalDateTime.now().minusMinutes(2);

        long recentCount =
                transactionRepository.countBySenderAccountNumberAndTimestampAfter(
                        transaction.getSenderAccountNumber(),
                        twoMinutesAgo
                );

        if (recentCount >= 3) {
            ruleScore += 30;
            message.append("Rapid transactions detected. ");
        }

        // ML CALL — SEND ALL FEATURES

        double mlProbability = 0.0;
        String mlRiskLevel = "SAFE";

        try {

            MLRequest request = MLRequest.builder()
                    .amount(transaction.getAmount())
                    .timestamp(transaction.getTimestamp().toString())
                    .foreignTransaction(transaction.getForeignTransaction())
                    .locationMismatch(transaction.getLocationMismatch())
                    .velocityLast24h(transaction.getVelocityLast24h())
                    .deviceTrustScore(transaction.getDeviceTrustScore())
                    .merchantCategory(transaction.getMerchantCategory())
                    .cardholderAge(transaction.getCardholderAge())
                    .build();

            MLResponse response =
                    restTemplate.postForObject(
                            "http://localhost:5000/predict",
                            request,
                            MLResponse.class
                    );

            if (response != null) {
                mlProbability = response.getFraudProbability();
                mlRiskLevel = response.getRiskLevel();
            }

            message.append("ML Risk: ").append(mlRiskLevel).append(". ");

        } catch (Exception e) {
            message.append("ML unavailable. ");
        }

        // HYBRID SCORING

        double finalScore = ruleScore + (mlProbability * 100);

        transaction.setFraudScore(finalScore);

        if (finalScore >= 100) {
            transaction.setFraudStatus("HIGH_RISK");
        } else if (finalScore >= 60) {
            transaction.setFraudStatus("MEDIUM_RISK");
        } else if (finalScore > 0) {
            transaction.setFraudStatus("LOW_RISK");
        } else {
            transaction.setFraudStatus("SAFE");
            message.append("No fraud detected.");
        }

        transaction.setMessage(message.toString());

        // CREATE ALERT FOR HIGH RISK

        if ("HIGH_RISK".equals(transaction.getFraudStatus())) {
            Alert alert = new Alert();
            alert.setTransactionId(transaction.getTransactionId());
            alert.setRuleTriggered("HYBRID_ENGINE");
            alert.setRiskScore(finalScore);
            alert.setMessage(message.toString());
            alertRepository.save(alert);
        }
    }
}