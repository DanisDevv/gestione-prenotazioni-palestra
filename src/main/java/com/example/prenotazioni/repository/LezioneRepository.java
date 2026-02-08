package com.example.prenotazioni.repository;

import com.example.prenotazioni.model.Lezione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LezioneRepository extends JpaRepository<Lezione, Long> {
    // Trova lezioni future ordinate per data
    List<Lezione> findAllByOrderByDataOraAsc();
}
