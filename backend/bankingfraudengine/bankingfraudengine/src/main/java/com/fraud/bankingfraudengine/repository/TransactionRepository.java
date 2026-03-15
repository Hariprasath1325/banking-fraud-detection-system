package com.fraud.bankingfraudengine.repository;

import com.fraud.bankingfraudengine.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    List<Transaction> findBySenderAccountNumber(String senderAccountNumber);

    List<Transaction> findBySenderAccountNumberAndTimestampAfter(
            String senderAccountNumber,
            LocalDateTime time
    );
    // Get transactions where account is sender OR receiver
    List<Transaction> findBySenderAccountNumberOrReceiverAccountNumber(
            String senderAccountNumber,
            String receiverAccountNumber
    );
    long countByFraudStatus(String fraudStatus);

    long countByStatus(String status);

    long countBySenderAccountNumberAndTimestampAfter(
            String senderAccountNumber,
            LocalDateTime time
    );

    List<Transaction> findByStatus(String status);

    List<Transaction> findByFraudStatus(String fraudStatus);

    // Paginated Top Risky Accounts
    @Query("""
        SELECT 
            t.senderAccountNumber,
            COUNT(t),
            SUM(t.amount)
        FROM Transaction t
        WHERE t.fraudStatus = 'HIGH_RISK'
        GROUP BY t.senderAccountNumber
        ORDER BY COUNT(t) DESC
    """)
    Page<Object[]> getTopRiskyAccounts(Pageable pageable);

    // Non-paginated (for CSV export)
    @Query("""
        SELECT 
            t.senderAccountNumber,
            COUNT(t),
            SUM(t.amount)
        FROM Transaction t
        WHERE t.fraudStatus = 'HIGH_RISK'
        GROUP BY t.senderAccountNumber
        ORDER BY COUNT(t) DESC
    """)
    List<Object[]> getTopRiskyAccounts();
}