package com.example.prenotazioni.repository;

import com.example.prenotazioni.model.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Aggiunto import
import java.util.Optional;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, Long> {
    Optional<Utente> findByUsername(String username);
    Optional<Utente> findByEmail(String email);
    Optional<Utente> findByUsernameOrEmail(String username, String email);
    List<Utente> findByRuolo(String ruolo);
}
