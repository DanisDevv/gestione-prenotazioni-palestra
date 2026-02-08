package com.example.prenotazioni.repository;

import com.example.prenotazioni.model.Prenotazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrenotazioneRepository extends JpaRepository<Prenotazione, Long> {
    List<Prenotazione> findByUtenteUsername(String username);
    
    // Conta quanti sono iscritti a una lezione (escluso rifiutati)
    long countByLezioneIdAndStatoNot(Long lezioneId, String statoEscluso);

    // Trova gli iscritti a una lezione
    List<Prenotazione> findByLezioneIdAndStatoNot(Long lezioneId, String statoEscluso);

    // Trova tutte le prenotazioni per le lezioni di un certo trainer
    List<Prenotazione> findByLezioneTrainer(String trainer);

    // Cancella tutte le prenotazioni di una lezione
    void deleteAllByLezioneId(Long lezioneId);
}
