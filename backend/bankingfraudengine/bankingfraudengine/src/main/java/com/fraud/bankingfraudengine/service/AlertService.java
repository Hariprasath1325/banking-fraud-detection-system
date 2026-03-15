package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.entity.Alert;
import com.fraud.bankingfraudengine.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public List<Alert> getHighRiskAlerts() {
        return alertRepository.findByRiskScoreGreaterThan(70);
    }

    public List<Alert> getAlertsByRule(String rule) {
        return alertRepository.findByRuleTriggered(rule);
    }
}