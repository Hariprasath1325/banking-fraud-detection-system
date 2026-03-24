package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.entity.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    // Read alert email from environment variable
    @Value("${fraud.alert.email}")
    private String alertEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendFraudAlert(Transaction tx) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(alertEmail);
        message.setSubject("⚠ Fraud Alert Detected");

        message.setText(
                "🚨 Fraud Alert Detected\n\n" +

                        "Transaction Details\n" +
                        "---------------------------\n" +

                        "Transaction ID: " + tx.getTransactionId() + "\n" +
                        "Sender Account: " + tx.getSenderAccountNumber() + "\n" +
                        "Receiver Account: " + tx.getReceiverAccountNumber() + "\n" +
                        "Amount: ₹" + tx.getAmount() + "\n" +
                        "Fraud Score: " + tx.getFraudScore() + "\n" +
                        "Risk Level: " + tx.getFraudStatus() + "\n" +
                        "Merchant Category: " + tx.getMerchantCategory() + "\n" +
                        "Transaction Time: " + tx.getTimestamp() + "\n\n" +

                        "Detection Reason:\n" +
                        tx.getMessage() + "\n\n" +

                        "This alert was generated automatically by the Fraud Detection System."
        );

        mailSender.send(message);
    }
}