package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Prenotazione;
import com.example.prenotazioni.repository.PrenotazioneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prenotazioni")
public class PrenotazioneController {

    @Autowired
    private PrenotazioneRepository repository;

    @GetMapping
    public List<Prenotazione> getPrenotazioni() {
        System.out.println("Richiesta GET /api/prenotazioni ricevuta");
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> creaPrenotazione(@RequestBody Prenotazione nuovaPrenotazione) {
        System.out.println("Ricevuta prenotazione POST: " + nuovaPrenotazione.getNomeCliente());
        
        if (nuovaPrenotazione.getDataOra() == null) {
             return ResponseEntity.badRequest().body("La data e l'ora sono obbligatorie");
        }

        // 1. Controllo: Non si può prenotare nel passato
        if (nuovaPrenotazione.getDataOra().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Non puoi prenotare in una data passata!");
        }

        // 2. Controllo: Esiste già una prenotazione per quell'ora (non rifiutata)?
        boolean occupato = repository.findAll().stream()
                .anyMatch(p -> p.getDataOra().equals(nuovaPrenotazione.getDataOra()) 
                            && !p.getStato().equals("RIFIUTATA"));
        
        if (occupato) {
            return ResponseEntity.badRequest().body("Spiacente, questo orario è già occupato!");
        }

        nuovaPrenotazione.setStato("IN_ATTESA");
        Prenotazione salvata = repository.save(nuovaPrenotazione);
        return ResponseEntity.ok(salvata);
    }

    @PostMapping("/{id}/conferma")
    public Prenotazione confermaPrenotazione(@PathVariable Long id, @RequestParam boolean accetta) {
        System.out.println("Conferma prenotazione ID: " + id + " Accetta: " + accetta);
        return repository.findById(id).map(p -> {
            p.setStato(accetta ? "CONFERMATA" : "RIFIUTATA");
            return repository.save(p);
        }).orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));
    }
}
