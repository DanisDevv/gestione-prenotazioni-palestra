package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Lezione;
import com.example.prenotazioni.model.Notifica; // Import corretto
import com.example.prenotazioni.model.Prenotazione;
import com.example.prenotazioni.model.Utente;
import com.example.prenotazioni.repository.LezioneRepository;
import com.example.prenotazioni.repository.NotificaRepository; // Import corretto
import com.example.prenotazioni.repository.PrenotazioneRepository;
import com.example.prenotazioni.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prenotazioni")
public class PrenotazioneController {

    @Autowired
    private PrenotazioneRepository repository;
    
    @Autowired
    private UtenteRepository utenteRepository;
    
    @Autowired
    private LezioneRepository lezioneRepository;

    @Autowired
    private NotificaRepository notificaRepository;

    @GetMapping
    public List<Prenotazione> getPrenotazioni(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String trainer) {
        
        System.out.println("GET prenotazioni. User: " + username + " Trainer: " + trainer);
        
        if (username != null && !username.isEmpty()) {
            return repository.findByUtenteUsername(username);
        }
        if (trainer != null && !trainer.isEmpty()) {
            return repository.findByLezioneTrainer(trainer);
        }
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> creaPrenotazione(@RequestBody Map<String, Object> payload) {
        String nomeCliente = (String) payload.get("nomeCliente");
        String dataOraStr = (String) payload.get("dataOra");
        Integer lezioneId = (Integer) payload.get("lezioneId");

        System.out.println("Prenotazione POST: " + nomeCliente);
        
        Prenotazione nuovaPrenotazione = new Prenotazione();
        nuovaPrenotazione.setNomeCliente(nomeCliente);
        
        Optional<Utente> utente = utenteRepository.findByUsername(nomeCliente);
        if (utente.isPresent()) {
            nuovaPrenotazione.setUtente(utente.get());
        } else {
             return ResponseEntity.badRequest().body("Utente non trovato nel sistema");
        }

        if (lezioneId != null) {
            @SuppressWarnings("null")
            Optional<Lezione> lezioneOpt = lezioneRepository.findById(Long.valueOf(lezioneId));
            if (lezioneOpt.isEmpty()) return ResponseEntity.badRequest().body("Lezione non trovata");
            
            Lezione lezione = lezioneOpt.get();
            
            boolean giaIscritto = repository.findByUtenteUsername(nomeCliente).stream()
                    .anyMatch(p -> p.getLezione() != null && p.getLezione().getId().equals(lezione.getId()) 
                                && !p.getStato().equals("RIFIUTATA"));
            
            if (giaIscritto) return ResponseEntity.badRequest().body("Sei già iscritto a questa lezione!");

            long iscrittiAttuali = repository.countByLezioneIdAndStatoNot(lezione.getId(), "RIFIUTATA");
            if (iscrittiAttuali >= lezione.getMaxPosti()) {
                return ResponseEntity.badRequest().body("Spiacente, il corso è AL COMPLETO!");
            }

            nuovaPrenotazione.setLezione(lezione);
            nuovaPrenotazione.setDataOra(lezione.getDataOra());
        } 
        else if (dataOraStr != null) {
             LocalDateTime dataOra = LocalDateTime.parse(dataOraStr);
             if (dataOra.isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("Non puoi prenotare nel passato!");
             }
             nuovaPrenotazione.setDataOra(dataOra);
        } else {
            return ResponseEntity.badRequest().body("Dati mancanti (Lezione o Data)");
        }

        nuovaPrenotazione.setStato("IN ATTESA");
        Prenotazione salvata = repository.save(nuovaPrenotazione);
        return ResponseEntity.ok(salvata);
    }

    @PostMapping("/{id}/conferma")
    public Prenotazione confermaPrenotazione(
            @PathVariable Long id, 
            @RequestParam boolean accetta, 
            @RequestParam(required = false) String motivazione,
            @RequestParam String admin) {
        
        System.out.println("Conferma ID: " + id + " Accetta: " + accetta + " Note: " + motivazione + " Admin: " + admin);
        
        if (id == null) throw new IllegalArgumentException("ID prenotazione mancante");

        //noinspection ConstantConditions
        return repository.findById(id).map(p -> {
            String nuovoStato = accetta ? "CONFERMATA" : "RIFIUTATA";
            p.setStato(nuovoStato);
            p.setAdminRevisione(admin);
            
            if (motivazione != null && !motivazione.isEmpty()) {
                p.setNote(motivazione);
            }
            
            String msg = "La tua prenotazione è stata " + (accetta ? "CONFERMATA ✅" : "RIFIUTATA ❌");
            if (!accetta && motivazione != null) msg += " Motivo: " + motivazione;
            
            notificaRepository.save(new Notifica(p.getNomeCliente(), msg));

            return repository.save(p);
        }).orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));
    }
}
