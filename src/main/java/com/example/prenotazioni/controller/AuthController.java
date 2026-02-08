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
        
        // Se non specificato, il ruolo è USER di default
        if (nuovoUtente.getRuolo() == null || nuovoUtente.getRuolo().isEmpty()) {
            nuovoUtente.setRuolo("USER");
        }
        
        Utente salvato = utenteRepository.save(nuovoUtente);
        return ResponseEntity.ok(salvato);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<Utente> utenteOpt = utenteRepository.findByUsername(username);

        if (utenteOpt.isPresent()) {
            Utente utente = utenteOpt.get();
            // Controllo password semplice (in produzione si userebbe bcrypt!)
            if (utente.getPassword().equals(password)) {
                return ResponseEntity.ok(utente);
            }
        }
        return ResponseEntity.status(401).body("Credenziali non valide");
    }
}
