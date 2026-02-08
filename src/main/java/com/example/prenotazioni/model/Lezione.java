package com.example.prenotazioni.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
public class Lezione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String materia; 
    private LocalDateTime dataOra; // Inizio
    private LocalTime orarioFine;  // Fine (solo orario, la data è la stessa)
    private String trainer; 
    private int maxPosti;

    public Lezione() {}

    public Lezione(String materia, LocalDateTime dataOra, LocalTime orarioFine, String trainer, int maxPosti) {
        this.materia = materia;
        this.dataOra = dataOra;
        this.orarioFine = orarioFine;
        this.trainer = trainer;
        this.maxPosti = maxPosti; 
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMateria() { return materia; }
    public void setMateria(String materia) { this.materia = materia; }
    public LocalDateTime getDataOra() { return dataOra; }
    public void setDataOra(LocalDateTime dataOra) { this.dataOra = dataOra; }
    
    public LocalTime getOrarioFine() { return orarioFine; }
    public void setOrarioFine(LocalTime orarioFine) { this.orarioFine = orarioFine; }

    public String getTrainer() { return trainer; }
    public void setTrainer(String trainer) { this.trainer = trainer; }
    public int getMaxPosti() { return maxPosti; }
    public void setMaxPosti(int maxPosti) { this.maxPosti = maxPosti; }
}
