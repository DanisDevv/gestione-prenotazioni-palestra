package com.example.prenotazioni.repository;
import com.example.prenotazioni.model.Notifica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificaRepository extends JpaRepository<Notifica, Long> {
    List<Notifica> findByUsernameDestinatarioOrderByDataOraDesc(String username);
}
