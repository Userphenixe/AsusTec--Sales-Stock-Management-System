package com.asustec.gestion_vente.dto;

import java.time.LocalDate;

public class LigneFactureDto {

    private Integer codecmd;
    private String client;
    private Integer codepdt;
    private String nompdt;
    private Integer prixpdt;
    private Integer qtecmd;
    private Integer total;
    private LocalDate datecmd;

    public Integer getCodecmd() { return codecmd; }
    public void setCodecmd(Integer codecmd) { this.codecmd = codecmd; }

    public String getClient() { return client; }
    public void setClient(String client) { this.client = client; }

    public Integer getCodepdt() { return codepdt; }
    public void setCodepdt(Integer codepdt) { this.codepdt = codepdt; }

    public String getNompdt() { return nompdt; }
    public void setNompdt(String nompdt) { this.nompdt = nompdt; }

    public Integer getPrixpdt() { return prixpdt; }
    public void setPrixpdt(Integer prixpdt) { this.prixpdt = prixpdt; }

    public Integer getQtecmd() { return qtecmd; }
    public void setQtecmd(Integer qtecmd) { this.qtecmd = qtecmd; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public LocalDate getDatecmd() { return datecmd; }
    public void setDatecmd(LocalDate datecmd) { this.datecmd = datecmd; }
}
