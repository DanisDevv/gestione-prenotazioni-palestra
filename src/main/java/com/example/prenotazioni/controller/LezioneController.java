package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Lezione;
import com.example.prenotazioni.repository.LezioneRepository;
import com.example.prenotazioni.repository.PrenotazioneRepository; // Aggiunto
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional; // Importante per la cancellazione

@RestController
@RequestMapping("/api/lezioni")
public class LezioneController {

    @Autowired
    private LezioneRepository lezioneRepository;
    
    @Autowired
    private PrenotazioneRepository prenotazioneRepository; // Serve per contare gli iscritti

    // Restituisce lezioni con info sui posti occupati
    @GetMapping
    public List<Map<String, Object>> getLezioni() {
        List<Lezione> lezioni = lezioneRepository.findAllByOrderByDataOraAsc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Lezione l : lezioni) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", l.getId());
            map.put("materia", l.getMateria());
            map.put("dataOra", l.getDataOra());
            map.put("orarioFine", l.getOrarioFine());
            map.put("trainer", l.getTrainer());
            map.put("maxPosti", l.getMaxPosti());
            
            // Conta iscritti reali
            long iscritti = prenotazioneRepository.countByLezioneIdAndStatoNot(l.getId(), "RIFIUTATA");
            map.put("iscrittiAttuali", iscritti);
            
            result.add(map);
        }
        return result;
    }

    @GetMapping("/{id}/iscritti")
    public List<String> getIscrittiLezione(@PathVariable Long id) {
        return prenotazioneRepository.findByLezioneIdAndStatoNot(id, "RIFIUTATA").stream()
                .map(p -> p.getNomeCliente())
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> creaLezione(@RequestBody Map<String, String> payload) {
        String materia = payload.get("materia");
        String data = payload.get("data"); 
        String oraInizio = payload.get("ora");
        String oraFine = payload.get("oraFine"); // Nuovo campo
        String trainer = payload.get("trainer");
        int maxPosti = Integer.parseInt(payload.get("maxPosti")); // Nuovo campo

        LocalDateTime dataOra = LocalDateTime.parse(data + "T" + oraInizio + ":00");
        LocalTime fine = LocalTime.parse(oraFine + ":00");

        Lezione nuovaLezione = new Lezione(materia, dataOra, fine, trainer, maxPosti);
        lezioneRepository.save(nuovaLezione);
        
        return ResponseEntity.ok("Lezione creata con successo");
    }
    
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> eliminaLezione(@PathVariable Long id) {
        if (id == null) return ResponseEntity.badRequest().body("ID mancante");
        
        // 1. Cancella tutte le prenotazioni collegate a questa lezione
        prenotazioneRepository.deleteAllByLezioneId(id);
        
        // 2. Cancella la lezione
        lezioneRepository.deleteById(id);
        
        return ResponseEntity.ok("Lezione e relative prenotazioni eliminate");
    }
}
