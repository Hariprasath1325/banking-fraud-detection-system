package com.fraud.bankingfraudengine.controller;

import com.fraud.bankingfraudengine.entity.User;
import com.fraud.bankingfraudengine.repository.UserRepository;
import com.fraud.bankingfraudengine.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    //  REGISTER USER

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> request) {

        if (userRepository.findByUsername(request.get("username")).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.get("username"));
        user.setPassword(encoder.encode(request.get("password")));
        user.setRole("USER");

        userRepository.save(user);

        return Map.of("message", "User registered successfully");
    }


    // LOGIN USER

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {

        User user = userRepository
                .findByUsername(request.get("username"))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.get("password"), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole()
        );

        return Map.of("token", token);
    }
}