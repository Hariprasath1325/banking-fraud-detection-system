package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.detection.FraudDetectionService;
import com.fraud.bankingfraudengine.entity.Transaction;
import com.fraud.bankingfraudengine.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class SimulationService {

    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;

    private final Random random = new Random();

    // Merchant categories list
    private final String[] merchantCategories = {
            "electronics",
            "grocery",
            "travel",
            "luxury",
            "food",
            "entertainment",
            "clothing",
            "pharmacy"
    };

    public SimulationService(TransactionRepository transactionRepository,
                             FraudDetectionService fraudDetectionService) {
        this.transactionRepository = transactionRepository;
        this.fraudDetectionService = fraudDetectionService;
    }

    // ===============================
    // GENERATE SIMULATION
    // ===============================

    public void generateSimulation(int count) {

        for (int i = 0; i < count; i++) {

            Transaction tx = new Transaction();

            tx.setSenderAccountNumber("ACC" + (1000 + random.nextInt(50)));
            tx.setReceiverAccountNumber("ACC" + (2000 + random.nextInt(50)));
            tx.setTimestamp(LocalDateTime.now());
            tx.setStatus("PROCESSED");
            tx.setSimulated(true);

            int scenario = random.nextInt(3); // 0 SAFE, 1 MEDIUM, 2 HIGH

            if (scenario == 0) {

                // SAFE SCENARIO
                tx.setSimulationType("SAFE");
                tx.setAmount(1000 + random.nextInt(10000));
                tx.setForeignTransaction(0);
                tx.setLocationMismatch(0);
                tx.setVelocityLast24h(random.nextInt(2));

                if (random.nextDouble() < 0.10) {
                    tx.setForeignTransaction(1);
                    tx.setLocationMismatch(1);
                }

            } else if (scenario == 1) {

                // MEDIUM SCENARIO
                tx.setSimulationType("MEDIUM");
                tx.setAmount(30000 + random.nextInt(40000));
                tx.setForeignTransaction(1);
                tx.setLocationMismatch(1);
                tx.setVelocityLast24h(3 + random.nextInt(3));

                if (random.nextDouble() < 0.10) {
                    tx.setForeignTransaction(0);
                    tx.setLocationMismatch(0);
                }

            } else {

                // HIGH SCENARIO
                tx.setSimulationType("HIGH");
                tx.setAmount(70000 + random.nextInt(200000));
                tx.setReceiverAccountNumber("BLK1001");
                tx.setForeignTransaction(1);
                tx.setLocationMismatch(1);
                tx.setVelocityLast24h(5 + random.nextInt(5));

                if (random.nextDouble() < 0.15) {
                    tx.setReceiverAccountNumber("ACC" + (2000 + random.nextInt(50)));
                }
            }

            // RANDOM MERCHANT CATEGORY
            String merchant =
                    merchantCategories[random.nextInt(merchantCategories.length)];
            tx.setMerchantCategory(merchant);

            // OTHER FRAUD FEATURES
            tx.setDeviceTrustScore(random.nextDouble());
            tx.setCardholderAge(18 + random.nextInt(50));

            // ===============================
            // SAVE FIRST TO GENERATE ID
            // ===============================

            tx = transactionRepository.save(tx);

            // ===============================
            // FRAUD DETECTION
            // ===============================

            fraudDetectionService.evaluateTransaction(tx);

            if ("HIGH_RISK".equals(tx.getFraudStatus())) {
                tx.setFlagged(true);
            }

            // SAVE AGAIN WITH FRAUD RESULT
            transactionRepository.save(tx);
        }
    }

    // ===============================
    // GET METHODS
    // ===============================

    public List<Transaction> getAllSimulated() {
        return transactionRepository.findAll()
                .stream()
                .filter(Transaction::isSimulated)
                .collect(Collectors.toList());
    }

    public List<Transaction> getFlagged() {
        return getAllSimulated()
                .stream()
                .filter(Transaction::isFlagged)
                .collect(Collectors.toList());
    }
}