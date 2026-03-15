package com.fraud.bankingfraudengine.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MetricsResponse {

    private long totalTransactions;
    private long safeTransactions;
    private long lowRiskTransactions;
    private long mediumRiskTransactions;
    private long highRiskTransactions;
    private long totalAlerts;
    private double fraudPercentage;
}