package com.example.prenotazioni.repository;

import com.example.prenotazioni.model.TurnoSalaPesi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TurnoSalaPesiRepository extends JpaRepository<TurnoSalaPesi, Long> {
    Optional<TurnoSalaPesi> findByDataAndOra(LocalDate data, int ora);
}
