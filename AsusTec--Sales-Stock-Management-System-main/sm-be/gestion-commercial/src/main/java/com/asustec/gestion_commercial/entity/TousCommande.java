package com.asustec.gestion_commercial.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tous_commandes")
public class TousCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer codetouscmd;

    private Integer codecmd;
    private String client;
    private Integer codepdt;
    private Integer qtecmd;
    private LocalDate datecmd;

    public Integer getCodetouscmd() {
        return codetouscmd;
    }

    public void setCodetouscmd(Integer codetouscmd) {
        this.codetouscmd = codetouscmd;
    }

    public Integer getCodecmd() {
        return codecmd;
    }

    public void setCodecmd(Integer codecmd) {
        this.codecmd = codecmd;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public Integer getCodepdt() {
        return codepdt;
    }

    public void setCodepdt(Integer codepdt) {
        this.codepdt = codepdt;
    }

    public Integer getQtecmd() {
        return qtecmd;
    }

    public void setQtecmd(Integer qtecmd) {
        this.qtecmd = qtecmd;
    }

    public LocalDate getDatecmd() {
        return datecmd;
    }

    public void setDatecmd(LocalDate datecmd) {
        this.datecmd = datecmd;
    }
}
