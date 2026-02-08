package com.example.prenotazioni.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import java.time.LocalDateTime;

@Entity
public class Prenotazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeCliente;
    private LocalDateTime dataOra;
    private String stato; // "IN_ATTESA", "CONFERMATA", "RIFIUTATA"

    @ManyToOne
    @JoinColumn(name = "utente_id")
    private Utente utente;

    @ManyToOne
    @JoinColumn(name = "lezione_id")
    private Lezione lezione; // Collegamento alla lezione specifica

    private String note; // Motivazione cancellazione o note admin
    private String adminRevisione; // Nome dell'admin che ha gestito la richiesta

    public Prenotazione() {
    }

    public Prenotazione(String nomeCliente, LocalDateTime dataOra, String stato, Utente utente) {
        this.nomeCliente = nomeCliente;
        this.dataOra = dataOra;
        this.stato = stato;
        this.utente = utente;
    }

    // Getters e Setters
    public Lezione getLezione() { return lezione; }
    public void setLezione(Lezione lezione) { this.lezione = lezione; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getAdminRevisione() { return adminRevisione; }
    public void setAdminRevisione(String adminRevisione) { this.adminRevisione = adminRevisione; }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public LocalDateTime getDataOra() {
        return dataOra;
    }

    public void setDataOra(LocalDateTime dataOra) {
        this.dataOra = dataOra;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public Utente getUtente() {
        return utente;
    }

    public void setUtente(Utente utente) {
        this.utente = utente;
    }
}
