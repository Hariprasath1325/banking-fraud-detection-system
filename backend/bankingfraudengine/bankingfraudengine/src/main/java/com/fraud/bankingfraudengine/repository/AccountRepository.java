package com.fraud.bankingfraudengine.repository;

import com.fraud.bankingfraudengine.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, String> {
}