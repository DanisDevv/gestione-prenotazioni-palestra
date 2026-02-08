package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Prenotazione;
import com.example.prenotazioni.model.TurnoSalaPesi;
import com.example.prenotazioni.model.Utente;
import com.example.prenotazioni.repository.PrenotazioneRepository;
import com.example.prenotazioni.repository.TurnoSalaPesiRepository;
import com.example.prenotazioni.repository.UtenteRepository; // Aggiunto import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/salapesi")
public class SalaPesiController {

    @Autowired
    private TurnoSalaPesiRepository turniRepo;

    @Autowired
    private PrenotazioneRepository prenotazioniRepo;

    @Autowired
    private UtenteRepository utenteRepo; // Aggiunto per recuperare foto trainer

    // RESTITUISCE IL TABELLONE GIORNALIERO (Turni di 2 ore: 8-10, 10-12, ...)
    @GetMapping
    public List<Map<String, Object>> getTabellone(@RequestParam String data) {
        LocalDate giorno = LocalDate.parse(data);
        List<Map<String, Object>> tabellone = new ArrayList<>();

        List<Prenotazione> prenotazioniGiorno = prenotazioniRepo.findAll().stream()
                .filter(p -> p.getDataOra().toLocalDate().equals(giorno) && !p.getStato().equals("RIFIUTATA"))
                .toList();

        // Ciclo ogni 2 ore, dalle 8:00 alle 20:00
        for (int ora = 8; ora <= 20; ora += 2) {
            Map<String, Object> slot = new HashMap<>();
            slot.put("ora", ora);
            
            // Cerca Turno Trainer
            Optional<TurnoSalaPesi> turno = turniRepo.findByDataAndOra(giorno, ora);
            String trainerNome = turno.map(TurnoSalaPesi::getTrainerNome).orElse(null);
            slot.put("trainer", trainerNome);

            // Cerca Foto Trainer
            String fotoUrl = null;
            if (trainerNome != null) {
                fotoUrl = utenteRepo.findByUsername(trainerNome)
                        .map(Utente::getFotoUrl)
                        .orElse(null);
            }
            slot.put("trainerFoto", fotoUrl);

            // Cerca Iscritti nello slot di 2 ore
            int startSlot = ora;
            int endSlot = ora + 2;
            
            List<Prenotazione> iscrittiPrenotazioni = prenotazioniGiorno.stream()
                    .filter(p -> p.getDataOra().getHour() >= startSlot && p.getDataOra().getHour() < endSlot)
                    .toList();
            
            List<Map<String, String>> listaDettagliata = new ArrayList<>();
            for (Prenotazione p : iscrittiPrenotazioni) {
                Map<String, String> utenteInfo = new HashMap<>();
                utenteInfo.put("nome", p.getNomeCliente());
                
                // Cerca foto utente
                String foto = utenteRepo.findByUsername(p.getNomeCliente())
                        .map(Utente::getFotoUrl)
                        .orElse(null);
                
                utenteInfo.put("foto", foto);
                listaDettagliata.add(utenteInfo);
            }
            
            slot.put("iscritti", listaDettagliata.size());
            slot.put("listaIscritti", listaDettagliata); // Ora inviamo oggetti {nome, foto}

            tabellone.add(slot);
        }
        return tabellone;
    }

    // TRAINER PRENDE IL TURNO
    @PostMapping("/trainer")
    public ResponseEntity<?> assegnaTrainer(@RequestBody Map<String, String> payload) {
        LocalDate data = LocalDate.parse(payload.get("data"));
        int ora = Integer.parseInt(payload.get("ora"));
        String trainer = payload.get("trainer");

        Optional<TurnoSalaPesi> turnoEsistente = turniRepo.findByDataAndOra(data, ora);
        
        TurnoSalaPesi turno = turnoEsistente.orElse(new TurnoSalaPesi(data, ora, ""));
        
        // Se il trainer clicca di nuovo, rimuove il turno (toggle)
        if (turno.getTrainerNome() != null && turno.getTrainerNome().equals(trainer)) {
            turniRepo.delete(turno);
            return ResponseEntity.ok("Turno rimosso");
        } else {
            turno.setTrainerNome(trainer);
            turniRepo.save(turno);
            return ResponseEntity.ok("Turno assegnato");
        }
    }

    // UTENTE SI DISISCRIVE DALLO SLOT
    @DeleteMapping("/prenotazione")
    public ResponseEntity<?> cancellaPrenotazione(@RequestParam String data, @RequestParam int ora, @RequestParam String username) {
        LocalDate giorno = LocalDate.parse(data);
        int startSlot = ora;
        int endSlot = ora + 2;

        // Cerca prenotazioni dell'utente in quella fascia oraria (es. tra le 10:00 e le 12:00)
        List<Prenotazione> daCancellare = prenotazioniRepo.findAll().stream()
                .filter(p -> p.getDataOra().toLocalDate().equals(giorno)
                        && p.getDataOra().getHour() >= startSlot 
                        && p.getDataOra().getHour() < endSlot
                        && p.getUtente().getUsername().equals(username))
                .toList();

        if (daCancellare.isEmpty()) {
            return ResponseEntity.badRequest().body("Nessuna prenotazione trovata da cancellare.");
        }

        prenotazioniRepo.deleteAll(daCancellare);
        return ResponseEntity.ok("Prenotazione cancellata");
    }
}
