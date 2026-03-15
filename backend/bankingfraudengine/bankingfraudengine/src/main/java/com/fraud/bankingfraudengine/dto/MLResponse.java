package com.fraud.bankingfraudengine.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MLResponse {

    private double fraudProbability;
    private String riskLevel;
}