package com.fraud.bankingfraudengine.controller;

import com.fraud.bankingfraudengine.dto.MetricsResponse;
import com.fraud.bankingfraudengine.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    @Autowired
    private MetricsService metricsService;

    @GetMapping("/summary")
    public MetricsResponse getSummary() {
        return metricsService.getSummary();
    }
}