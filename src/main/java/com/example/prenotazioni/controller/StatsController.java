package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Lezione;
import com.example.prenotazioni.model.Prenotazione;
import com.example.prenotazioni.repository.LezioneRepository;
import com.example.prenotazioni.repository.PrenotazioneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private PrenotazioneRepository prenotazioneRepository;
    
    @Autowired
    private LezioneRepository lezioneRepository;

    @GetMapping
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Prenotazione> tutte = prenotazioneRepository.findAll();

        // 1. STATI (Confermate, Attesa, Rifiutate)
        Map<String, Long> stati = tutte.stream()
                .collect(Collectors.groupingBy(Prenotazione::getStato, Collectors.counting()));
        stats.put("stati", stati);

        // 2. PRENOTAZIONI OGGI
        LocalDate oggi = LocalDate.now();
        long oggiCount = tutte.stream()
                .filter(p -> p.getDataOra().toLocalDate().equals(oggi))
                .count();
        stats.put("oggi", oggiCount);

        // 3. TOP CORSI (Lezioni con più iscritti)
        // Nota: Questa è una statistica semplificata basata sulle lezioni esistenti
        Map<String, Long> corsiPopolari = new HashMap<>();
        List<Lezione> lezioni = lezioneRepository.findAll();
        for (Lezione l : lezioni) {
            long count = prenotazioneRepository.countByLezioneIdAndStatoNot(l.getId(), "RIFIUTATA");
            if (count > 0) {
                // Raggruppa per Materia (es. tutti gli Yoga)
                @SuppressWarnings("null")
                Long result = corsiPopolari.merge(l.getMateria(), count, Long::sum);
            }
        }
        stats.put("corsi", corsiPopolari);

        return stats;
    }
}
