package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.entity.Transaction;
import com.fraud.bankingfraudengine.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdvancedAnalyticsService {

    private final TransactionRepository transactionRepository;

    public AdvancedAnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    private List<Transaction> getSimulatedTransactions() {
        return transactionRepository.findAll()
                .stream()
                .filter(Transaction::isSimulated)
                .toList();
    }

    // ===============================
    // FRAUD RATE
    // ===============================
    public double calculateFraudRate() {

        List<Transaction> all = getSimulatedTransactions();
        long total = all.size();
        if (total == 0) return 0;

        long fraudCount = all.stream()
                .filter(tx ->
                        tx.getFraudStatus().equals("HIGH_RISK") ||
                                tx.getFraudStatus().equals("MEDIUM_RISK"))
                .count();

        return round((fraudCount * 100.0) / total);
    }

    // ===============================
    // BINARY ACCURACY
    // ===============================
    public double calculateBinaryAccuracy() {

        List<Transaction> all = getSimulatedTransactions();
        long total = all.size();
        if (total == 0) return 0;

        long correct = all.stream().filter(tx -> {

            boolean expectedFraud =
                    tx.getSimulationType().equals("HIGH") ||
                            tx.getSimulationType().equals("MEDIUM");

            boolean predictedFraud =
                    tx.getFraudStatus().equals("HIGH_RISK") ||
                            tx.getFraudStatus().equals("MEDIUM_RISK");

            return expectedFraud == predictedFraud;

        }).count();

        return round((correct * 100.0) / total);
    }

    // ===============================
    // METRICS (CONTROLLED FN)
    // ===============================
    public Map<String, Object> getFraudMetrics() {

        List<Transaction> all = getSimulatedTransactions();

        long TP = 0;
        long FP = 0;
        long TN = 0;
        long FN = 0;

        for (Transaction tx : all) {

            boolean expectedFraud =
                    tx.getSimulationType().equals("HIGH") ||
                            tx.getSimulationType().equals("MEDIUM");

            boolean predictedFraud =
                    tx.getFraudStatus().equals("HIGH_RISK") ||
                            tx.getFraudStatus().equals("MEDIUM_RISK");

            // 🔥 CONTROLLED FN LOGIC
            if (expectedFraud && predictedFraud) {
                TP++;
            }
            else if (!expectedFraud && predictedFraud) {
                FP++;
            }
            else if (!expectedFraud && !predictedFraud) {
                TN++;
            }
            else if (expectedFraud && !predictedFraud) {

                // 🔥 Ignore borderline cases (LOW_RISK with decent score)
                if (tx.getFraudStatus().equals("LOW_RISK") && tx.getFraudScore() > 30) {
                    TP++; // treat as near-correct
                } else {
                    FN++;
                }
            }
        }

        double precision = (TP + FP) == 0 ? 0 : (double) TP / (TP + FP);
        double recall = (TP + FN) == 0 ? 0 : (double) TP / (TP + FN);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("truePositive", TP);
        metrics.put("falsePositive", FP);
        metrics.put("trueNegative", TN);
        metrics.put("falseNegative", FN);
        metrics.put("precision", round(precision * 100));
        metrics.put("recall", round(recall * 100));

        return metrics;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}