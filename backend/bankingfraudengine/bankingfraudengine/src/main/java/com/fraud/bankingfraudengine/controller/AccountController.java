package com.fraud.bankingfraudengine.controller;

import com.fraud.bankingfraudengine.dto.AccountRequest;
import com.fraud.bankingfraudengine.entity.Account;
import com.fraud.bankingfraudengine.repository.AccountRepository;
import com.fraud.bankingfraudengine.service.AccountService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final AccountRepository accountRepository;

    public AccountController(AccountService accountService,
                             AccountRepository accountRepository) {
        this.accountService = accountService;
        this.accountRepository = accountRepository;
    }

    // CREATE ACCOUNT (ADMIN ONLY)


    @PostMapping
    public Account createAccount(@RequestBody AccountRequest request) {
        return accountService.createAccount(request);
    }

    // GET ACCOUNT BY ID (FOR TESTING)

    @GetMapping("/{accountNumber}")
    public Account getAccount(@PathVariable String accountNumber) {
        return accountRepository.findById(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }
}