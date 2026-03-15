package com.fraud.bankingfraudengine.controller;

import com.fraud.bankingfraudengine.entity.Transaction;
import com.fraud.bankingfraudengine.service.SimulationService;
import com.fraud.bankingfraudengine.service.AdvancedAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final SimulationService simulationService;
    private final AdvancedAnalyticsService advancedAnalyticsService;

    public SimulationController(SimulationService simulationService,
                                AdvancedAnalyticsService advancedAnalyticsService) {
        this.simulationService = simulationService;
        this.advancedAnalyticsService = advancedAnalyticsService;
    }

    // ===============================
    // GENERATE SIMULATION DATA
    // ===============================

    @PostMapping("/generate")
    public ResponseEntity<String> generateSimulation(
            @RequestParam(defaultValue = "50") int count) {

        simulationService.generateSimulation(count);
        return ResponseEntity.ok("Simulation generated: " + count + " transactions.");
    }

    // ===============================
    // GET ALL SIMULATED
    // ===============================

    @GetMapping("/all")
    public List<Transaction> getAllSimulated() {
        return simulationService.getAllSimulated();
    }

    // ===============================
    // GET FLAGGED (HIGH RISK)
    // ===============================

    @GetMapping("/flagged")
    public List<Transaction> getFlagged() {
        return simulationService.getFlagged();
    }

    // ===============================
    // GET SAFE
    // ===============================

    @GetMapping("/safe")
    public List<Transaction> getSafeTransactions() {
        return simulationService.getAllSimulated()
                .stream()
                .filter(tx ->
                        "SAFE".equals(tx.getFraudStatus()) ||
                                "LOW_RISK".equals(tx.getFraudStatus())
                )
                .toList();
    }

    // ===============================
    // GET MEDIUM RISK
    // ===============================

    @GetMapping("/medium")
    public List<Transaction> getMediumRiskTransactions() {
        return simulationService.getAllSimulated()
                .stream()
                .filter(tx -> "MEDIUM_RISK".equals(tx.getFraudStatus()))
                .collect(Collectors.toList());
    }

    // ===============================
    // GET SUMMARY
    // ===============================

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {

        List<Transaction> all = simulationService.getAllSimulated();
        List<Transaction> flagged = simulationService.getFlagged();

        long safe = all.stream()
                .filter(tx ->
                        "SAFE".equals(tx.getFraudStatus()) ||
                                "LOW_RISK".equals(tx.getFraudStatus())
                )
                .count();

        long medium = all.stream()
                .filter(tx -> "MEDIUM_RISK".equals(tx.getFraudStatus()))
                .count();

        long high = all.stream()
                .filter(tx -> "HIGH_RISK".equals(tx.getFraudStatus()))
                .count();

        return ResponseEntity.ok(
                new Object() {
                    public final long totalSimulated = all.size();
                    public final long safeCount = safe;
                    public final long mediumRiskCount = medium;
                    public final long highRiskCount = high;
                    public final long flaggedCount = flagged.size();
                }
        );
    }

    // ===============================
    // FRAUD RATE PERCENTAGE
    // ===============================

    @GetMapping("/fraud-rate")
    public double getFraudRate() {
        return advancedAnalyticsService.calculateFraudRate();
    }


    @GetMapping("/binary-accuracy")
    public double getBinaryAccuracy() {
        return advancedAnalyticsService.calculateBinaryAccuracy();
    }

    @GetMapping("/metrics")
    public Object getFraudMetrics() {
        return advancedAnalyticsService.getFraudMetrics();
    }

}