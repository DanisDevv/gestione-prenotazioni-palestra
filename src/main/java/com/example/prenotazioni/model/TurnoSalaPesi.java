package com.example.prenotazioni.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;

@Entity
public class TurnoSalaPesi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate data;
    private int ora; // Es: 8 per fascia 08:00-09:00
    private String trainerNome; // Nome del trainer di turno

    public TurnoSalaPesi() {}

    public TurnoSalaPesi(LocalDate data, int ora, String trainerNome) {
        this.data = data;
        this.ora = ora;
        this.trainerNome = trainerNome;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public int getOra() { return ora; }
    public void setOra(int ora) { this.ora = ora; }
    public String getTrainerNome() { return trainerNome; }
    public void setTrainerNome(String trainerNome) { this.trainerNome = trainerNome; }
}
