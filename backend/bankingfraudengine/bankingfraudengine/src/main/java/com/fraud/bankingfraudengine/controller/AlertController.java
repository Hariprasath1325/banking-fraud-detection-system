package com.fraud.bankingfraudengine.controller;

import com.fraud.bankingfraudengine.entity.Alert;
import com.fraud.bankingfraudengine.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @GetMapping("/high-risk")
    public List<Alert> getHighRiskAlerts() {
        return alertService.getHighRiskAlerts();
    }

    @GetMapping("/by-rule/{rule}")
    public List<Alert> getAlertsByRule(@PathVariable String rule) {
        return alertService.getAlertsByRule(rule);
    }
}