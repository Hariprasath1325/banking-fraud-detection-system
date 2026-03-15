package com.fraud.bankingfraudengine.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MLRequest {

    private double amount;
    private String timestamp;

    private int foreignTransaction;
    private int locationMismatch;

    private double velocityLast24h;
    private double deviceTrustScore;

    private String merchantCategory;
    private int cardholderAge;
}