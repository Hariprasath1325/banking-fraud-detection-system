package com.fraud.bankingfraudengine.repository;

import com.fraud.bankingfraudengine.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByRiskScoreGreaterThan(double riskScore);

    List<Alert> findByRuleTriggered(String ruleTriggered);
}