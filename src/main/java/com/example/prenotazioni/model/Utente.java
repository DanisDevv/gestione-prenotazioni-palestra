package com.example.prenotazioni.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;

@Entity
public class Utente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;
    private String ruolo; // "ADMIN" o "USER"
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String bio;   // Descrizione del trainer
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String fotoUrl; // Link o Base64 dell'immagine
        public Utente() {}
    
        public Utente(String username, String email, String password, String ruolo) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.ruolo = ruolo;
        }
    
        // Getters e Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getRuolo() { return ruolo; }
        public void setRuolo(String ruolo) { this.ruolo = ruolo; }
    
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
    
        public String getFotoUrl() { return fotoUrl; }
        public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    }
    
