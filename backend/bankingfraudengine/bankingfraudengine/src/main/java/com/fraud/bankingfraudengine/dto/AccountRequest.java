package com.fraud.bankingfraudengine.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountRequest {

    private String accountNumber;
    private String accountHolderName;
    private String pin;
    private double initialBalance;

    // NEW FIELDS
    private int age;
    private String country;
}