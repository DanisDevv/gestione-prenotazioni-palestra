package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Utente;
import com.example.prenotazioni.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    @Autowired
    private UtenteRepository utenteRepository;

    // LISTA TUTTI GLI UTENTI (Solo per Admin)
    @GetMapping
    public List<Utente> getAllUtenti() {
        return utenteRepository.findAll();
    }

    // CAMBIA RUOLO (Solo per Admin)
    @PostMapping("/role")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateRole(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String nuovoRuolo = payload.get("ruolo"); // "ADMIN", "TRAINER", "USER"

        Optional<Utente> utenteOpt = utenteRepository.findByUsername(username);
        if (utenteOpt.isEmpty()) return ResponseEntity.badRequest().body("Utente non trovato");

        Utente utente = utenteOpt.get();
        utente.setRuolo(nuovoRuolo);
        
        utenteRepository.save(utente);
        return ResponseEntity.ok("Ruolo aggiornato a " + nuovoRuolo);
    }

    // 1. L'utente aggiorna il PROPRIO profilo (Foto e Bio)
    @PostMapping("/me/update")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String fotoUrl = payload.get("fotoUrl");
        String bio = payload.get("bio");

        Optional<Utente> utenteOpt = utenteRepository.findByUsername(username);
        if (utenteOpt.isEmpty()) return ResponseEntity.badRequest().body("Utente non trovato");

        Utente utente = utenteOpt.get();
        if (fotoUrl != null) utente.setFotoUrl(fotoUrl);
        if (bio != null) utente.setBio(bio); // Anche un user normale potrebbe volere una bio in futuro

        Utente aggiornato = utenteRepository.save(utente);
        return ResponseEntity.ok(aggiornato);
    }

    // 2. L'Admin aggiorna un Trainer specifico
    @PostMapping("/admin/update-trainer")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateTrainer(@RequestBody Map<String, String> payload) {
        String targetUsername = payload.get("targetUsername");
        String fotoUrl = payload.get("fotoUrl");
        String bio = payload.get("bio");

        Optional<Utente> utenteOpt = utenteRepository.findByUsername(targetUsername);
        if (utenteOpt.isEmpty()) return ResponseEntity.badRequest().body("Trainer non trovato");

        Utente trainer = utenteOpt.get();
        if (fotoUrl != null) trainer.setFotoUrl(fotoUrl);
        if (bio != null) trainer.setBio(bio);

        utenteRepository.save(trainer);
        return ResponseEntity.ok("Trainer aggiornato");
    }
}
