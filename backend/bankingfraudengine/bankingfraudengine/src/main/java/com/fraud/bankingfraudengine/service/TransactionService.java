package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.detection.FraudDetectionService;
import com.fraud.bankingfraudengine.entity.Account;
import com.fraud.bankingfraudengine.entity.Transaction;
import com.fraud.bankingfraudengine.repository.AccountRepository;
import com.fraud.bankingfraudengine.repository.TransactionRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final FraudDetectionService fraudDetectionService;
    private final BCryptPasswordEncoder passwordEncoder;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              FraudDetectionService fraudDetectionService,
                              BCryptPasswordEncoder passwordEncoder) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.fraudDetectionService = fraudDetectionService;
        this.passwordEncoder = passwordEncoder;
    }

    public Transaction createTransaction(Transaction transaction) {


        //AMOUNT VALIDATION


        if (transaction.getAmount() <= 0) {
            throw new RuntimeException("Invalid transaction amount. Amount must be greater than 0.");
        }

        if (transaction.getAmount() > 10000000) {
            throw new RuntimeException("Transaction amount exceeds maximum allowed limit.");
        }

        //  VALIDATE SENDER ACCOUNT


        Account sender = accountRepository.findById(transaction.getSenderAccountNumber())
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        Account receiver = accountRepository.findById(transaction.getReceiverAccountNumber())
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        if (transaction.getPin() == null || transaction.getPin().isBlank()) {
            throw new RuntimeException("PIN is required");
        }

        if (!passwordEncoder.matches(transaction.getPin(), sender.getPinHash())) {
            throw new RuntimeException("Invalid PIN");
        }

        if (sender.getBalance() < transaction.getAmount()) {
            throw new RuntimeException("Insufficient balance");
        }

        // SET BASIC DETAILS


        transaction.setTimestamp(LocalDateTime.now());
        transaction.setStatus("PROCESSING");

        // GENERATE FRAUD CONTEXT FEATURES

        String[] categories = {"electronics", "grocery", "travel", "luxury", "food"};
        String merchant = categories[(int) (Math.random() * categories.length)];
        transaction.setMerchantCategory(merchant);

        int foreign = sender.getCountry().equalsIgnoreCase(receiver.getCountry()) ? 0 : 1;
        transaction.setForeignTransaction(foreign);

        int locationMismatch = transaction.getReceiverAccountNumber().startsWith("BLK") ? 1 : 0;
        transaction.setLocationMismatch(locationMismatch);

        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        long countLast24 =
                transactionRepository.countBySenderAccountNumberAndTimestampAfter(
                        transaction.getSenderAccountNumber(),
                        last24Hours
                );
        transaction.setVelocityLast24h(countLast24);

        double deviceTrust = Math.random();
        transaction.setDeviceTrustScore(deviceTrust);

        transaction.setCardholderAge(sender.getAge());

        // CALL FRAUD DETECTION ENGINE

        fraudDetectionService.evaluateTransaction(transaction);

        // FINAL DECISION LOGIC

        if ("HIGH_RISK".equals(transaction.getFraudStatus())) {
            transaction.setStatus("BLOCKED");
            transaction.setMessage(transaction.getMessage() + " Transaction blocked due to high fraud risk.");
        } else if ("MEDIUM_RISK".equals(transaction.getFraudStatus())) {
            transaction.setStatus("REVIEW_PENDING");
            transaction.setMessage(transaction.getMessage() + " Transaction pending manual review.");
        } else {
            transaction.setStatus("SUCCESS");

            sender.setBalance(sender.getBalance() - transaction.getAmount());
            receiver.setBalance(receiver.getBalance() + transaction.getAmount());

            accountRepository.save(sender);
            accountRepository.save(receiver);
        }

        return transactionRepository.save(transaction);
    }

    // GET TRANSACTIONS BY ACCOUNT
    public java.util.List<Transaction> getTransactionsByAccount(String accountNumber) {
        return transactionRepository
                .findBySenderAccountNumberOrReceiverAccountNumber(
                        accountNumber,
                        accountNumber
                );
    }
}