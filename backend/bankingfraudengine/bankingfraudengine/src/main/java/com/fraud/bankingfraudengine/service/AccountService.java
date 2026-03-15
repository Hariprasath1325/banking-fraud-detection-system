package com.fraud.bankingfraudengine.service;

import com.fraud.bankingfraudengine.dto.AccountRequest;
import com.fraud.bankingfraudengine.entity.Account;
import com.fraud.bankingfraudengine.repository.AccountRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AccountService(AccountRepository accountRepository,
                          BCryptPasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Account createAccount(AccountRequest request) {

        if (accountRepository.existsById(request.getAccountNumber())) {
            throw new RuntimeException("Account already exists");
        }

        Account account = new Account();
        account.setAccountNumber(request.getAccountNumber());
        account.setAccountHolderName(request.getAccountHolderName());

        // Encrypt PIN
        String hashedPin = passwordEncoder.encode(request.getPin());
        account.setPinHash(hashedPin);

        account.setBalance(request.getInitialBalance());
        account.setStatus("ACTIVE");
        account.setFailedAttempts(0);

        // NEW FIELDS
        account.setAge(request.getAge());
        account.setCountry(request.getCountry());

        return accountRepository.save(account);
    }
}