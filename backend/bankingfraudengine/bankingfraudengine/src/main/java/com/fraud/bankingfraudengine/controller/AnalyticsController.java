package com.fraud.bankingfraudengine.controller;

import com.fraud.bankingfraudengine.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }


    // JSON SUMMARY FOR DASHBOARD

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return analyticsService.getJsonSummary();
    }

    // EXPORT FILTERED

    @GetMapping("/export")
    public ResponseEntity<String> exportFiltered(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fraudStatus,
            @RequestParam(required = false) String sender,
            @RequestParam(required = false) String receiver,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        String csv = analyticsService.exportFilteredTransactions(
                status, fraudStatus, sender, receiver, startDate, endDate
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=filtered_transactions.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }


    // EXPORT FRAUD ONLY

    @GetMapping("/export-fraud")
    public ResponseEntity<String> exportFraud() {

        String csv = analyticsService.exportFraudTransactions();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=fraud_transactions.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }

    // EXPORT SUMMARY (CSV)

    @GetMapping("/export-summary")
    public ResponseEntity<String> exportSummary() {

        String csv = analyticsService.exportSummary();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=summary_report.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }


    // EXPORT TOP RISKY ACCOUNTS

    @GetMapping("/export-top-risky")
    public ResponseEntity<String> exportTopRisky() {

        String csv = analyticsService.exportTopRiskyAccounts();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=top_risky_accounts.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }
}