package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.entity.Transaction;
import com.fraud.bankingfraudengine.repository.TransactionRepository;
import com.fraud.bankingfraudengine.specification.TransactionSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public AnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // JSON SUMMARY FOR DASHBOARD

    public Map<String, Object> getJsonSummary() {

        long total = transactionRepository.count();
        long high = transactionRepository.countByFraudStatus("HIGH_RISK");
        long medium = transactionRepository.countByFraudStatus("MEDIUM_RISK");
        long safe = transactionRepository.countByFraudStatus("SAFE");

        double fraudRate = total == 0 ? 0 :
                ((double) (high + medium) / total) * 100;

        Map<String, Object> response = new HashMap<>();
        response.put("totalTransactions", total);
        response.put("highRiskCount", high);
        response.put("mediumRiskCount", medium);
        response.put("safeCount", safe);
        response.put("fraudRatePercentage", round(fraudRate));

        return response;
    }

    // EXPORT FILTERED TRANSACTIONS

    public String exportFilteredTransactions(
            String status,
            String fraudStatus,
            String sender,
            String receiver,
            LocalDate startDate,
            LocalDate endDate
    ) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : null;

        Specification<Transaction> spec = Specification
                .where(TransactionSpecification.hasStatus(status))
                .and(TransactionSpecification.hasFraudStatus(fraudStatus))
                .and(TransactionSpecification.hasSender(sender))
                .and(TransactionSpecification.hasReceiver(receiver))
                .and(TransactionSpecification.betweenDates(start, end));

        List<Transaction> transactions = transactionRepository.findAll(spec);

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        pw.println("TransactionId,Sender,Receiver,Amount,Status,FraudStatus,Timestamp");

        for (Transaction t : transactions) {
            pw.println(t.getTransactionId() + "," +
                    t.getSenderAccountNumber() + "," +
                    t.getReceiverAccountNumber() + "," +
                    t.getAmount() + "," +
                    t.getStatus() + "," +
                    t.getFraudStatus() + "," +
                    t.getTimestamp());
        }

        pw.flush();
        return sw.toString();
    }

    // EXPORT FRAUD ONLY

    public String exportFraudTransactions() {

        List<Transaction> transactions =
                transactionRepository.findByFraudStatus("HIGH_RISK");

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        pw.println("TransactionId,Sender,Receiver,Amount,FraudScore,Timestamp");

        for (Transaction t : transactions) {
            pw.println(t.getTransactionId() + "," +
                    t.getSenderAccountNumber() + "," +
                    t.getReceiverAccountNumber() + "," +
                    t.getAmount() + "," +
                    t.getFraudScore() + "," +
                    t.getTimestamp());
        }

        pw.flush();
        return sw.toString();
    }

    // EXPORT SUMMARY (CSV)

    public String exportSummary() {

        long total = transactionRepository.count();
        long high = transactionRepository.countByFraudStatus("HIGH_RISK");
        long medium = transactionRepository.countByFraudStatus("MEDIUM_RISK");
        long safe = transactionRepository.countByFraudStatus("SAFE");

        double fraudRate = total == 0 ? 0 :
                ((double) (high + medium) / total) * 100;

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        pw.println("Metric,Value");
        pw.println("Total Transactions," + total);
        pw.println("High Risk," + high);
        pw.println("Medium Risk," + medium);
        pw.println("Safe," + safe);
        pw.println("Fraud Rate (%)," + round(fraudRate));

        pw.flush();
        return sw.toString();
    }

    // EXPORT TOP RISKY ACCOUNTS

    public String exportTopRiskyAccounts() {

        List<Object[]> results =
                transactionRepository.getTopRiskyAccounts();

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        pw.println("SenderAccount,HighRiskCount,TotalRiskAmount");

        for (Object[] row : results) {
            pw.println(row[0] + "," +
                    row[1] + "," +
                    round((Double) row[2]));
        }

        pw.flush();
        return sw.toString();
    }
}