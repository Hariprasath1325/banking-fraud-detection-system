package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.dto.MetricsResponse;
import com.fraud.bankingfraudengine.repository.AlertRepository;
import com.fraud.bankingfraudengine.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MetricsService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AlertRepository alertRepository;

    public MetricsResponse getSummary() {

        long totalTransactions = transactionRepository.count();

        long safe = transactionRepository.countByFraudStatus("SAFE");
        long low = transactionRepository.countByFraudStatus("LOW_RISK");
        long medium = transactionRepository.countByFraudStatus("MEDIUM_RISK");
        long high = transactionRepository.countByFraudStatus("HIGH_RISK");

        long totalAlerts = alertRepository.count();

        double fraudPercentage = 0;

        if (totalTransactions > 0) {
            fraudPercentage = ((double) high / totalTransactions) * 100;
        }

        return MetricsResponse.builder()
                .totalTransactions(totalTransactions)
                .safeTransactions(safe)
                .lowRiskTransactions(low)
                .mediumRiskTransactions(medium)
                .highRiskTransactions(high)
                .totalAlerts(totalAlerts)
                .fraudPercentage(fraudPercentage)
                .build();
    }
}