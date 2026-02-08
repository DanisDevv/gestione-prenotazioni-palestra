package com.example.prenotazioni.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Notifica {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String usernameDestinatario;
    private String messaggio;
    private LocalDateTime dataOra;
    private boolean letta;

    public Notifica() {}
    public Notifica(String usernameDestinatario, String messaggio) {
        this.usernameDestinatario = usernameDestinatario;
        this.messaggio = messaggio;
        this.dataOra = LocalDateTime.now();
        this.letta = false;
    }

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsernameDestinatario() { return usernameDestinatario; }
    public void setUsernameDestinatario(String u) { this.usernameDestinatario = u; }
    public String getMessaggio() { return messaggio; }
    public void setMessaggio(String m) { this.messaggio = m; }
    public LocalDateTime getDataOra() { return dataOra; }
    public boolean isLetta() { return letta; }
    public void setLetta(boolean l) { this.letta = l; }
}
