package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Utente;
import com.example.prenotazioni.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UtenteRepository utenteRepository;

    @PostMapping("/registrati")
    public ResponseEntity<?> registrati(@RequestBody Utente nuovoUtente) {
        if (utenteRepository.findByUsername(nuovoUtente.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username già esistente!");
        }
        if (nuovoUtente.getEmail() != null && utenteRepository.findByEmail(nuovoUtente.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email già registrata!");
        }
        
        // FORZATURA: Chi si registra dal sito è SEMPRE un utente normale (Atleta)
        nuovoUtente.setRuolo("USER");
        
        Utente salvato = utenteRepository.save(nuovoUtente);
        return ResponseEntity.ok(salvato);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String input = credentials.get("username"); // Può essere username o email
        String password = credentials.get("password");
        
        System.out.println("Tentativo di login con input: " + input);

        // 1. Cerca per Username
        Optional<Utente> utenteOpt = utenteRepository.findByUsername(input);
        
        // 2. Se non trovato, cerca per Email
        if (utenteOpt.isEmpty()) {
            utenteOpt = utenteRepository.findByEmail(input);
        }

        if (utenteOpt.isPresent()) {
            Utente utente = utenteOpt.get();
            System.out.println("Utente trovato: " + utente.getUsername());
            if (utente.getPassword().equals(password)) {
                return ResponseEntity.ok(utente);
            } else {
                System.out.println("Password errata per: " + input);
            }
        } else {
            System.out.println("Nessun utente trovato con questo input.");
        }
        return ResponseEntity.status(401).body("Credenziali non valide");
    }
}
