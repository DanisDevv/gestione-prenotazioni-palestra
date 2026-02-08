package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Utente;
import com.example.prenotazioni.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    @Autowired
    private UtenteRepository utenteRepository;

    @GetMapping
    public List<Utente> getTrainers() {
        // Restituisce tutti gli utenti con ruolo TRAINER
        return utenteRepository.findByRuolo("TRAINER");
    }
}
