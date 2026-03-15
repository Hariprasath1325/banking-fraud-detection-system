package com.fraud.bankingfraudengine.specification;

import com.fraud.bankingfraudengine.entity.Transaction;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class TransactionSpecification {

    public static Specification<Transaction> hasStatus(String status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Transaction> hasFraudStatus(String fraudStatus) {
        return (root, query, cb) ->
                fraudStatus == null ? null : cb.equal(root.get("fraudStatus"), fraudStatus);
    }

    public static Specification<Transaction> hasSender(String sender) {
        return (root, query, cb) ->
                sender == null ? null : cb.equal(root.get("senderAccountNumber"), sender);
    }

    public static Specification<Transaction> hasReceiver(String receiver) {
        return (root, query, cb) ->
                receiver == null ? null : cb.equal(root.get("receiverAccountNumber"), receiver);
    }

    public static Specification<Transaction> betweenDates(LocalDateTime start, LocalDateTime end) {
        return (root, query, cb) -> {
            if (start == null && end == null) return null;
            if (start != null && end != null)
                return cb.between(root.get("timestamp"), start, end);
            if (start != null)
                return cb.greaterThanOrEqualTo(root.get("timestamp"), start);
            return cb.lessThanOrEqualTo(root.get("timestamp"), end);
        };
    }
}