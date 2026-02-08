package com.example.prenotazioni.controller;

import com.example.prenotazioni.model.Notifica;
import com.example.prenotazioni.repository.NotificaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifiche")
public class NotificaController {

    @Autowired
    private NotificaRepository notificaRepository;

    @GetMapping
    public List<Notifica> getMieNotifiche(@RequestParam String username) {
        return notificaRepository.findByUsernameDestinatarioOrderByDataOraDesc(username);
    }
}
