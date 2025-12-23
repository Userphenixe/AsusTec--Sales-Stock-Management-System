package com.asustec.gestion_vente.dto;

public class ProduitDto {

    private Integer codepdt;
    private String nompdt;
    private String descpdt;
    private Integer prixpdt;

    // + champ optionnel pour quantité dispo
    private Integer qteStock;

    public Integer getCodepdt() { return codepdt; }
    public void setCodepdt(Integer codepdt) { this.codepdt = codepdt; }

    public String getNompdt() { return nompdt; }
    public void setNompdt(String nompdt) { this.nompdt = nompdt; }

    public String getDescpdt() { return descpdt; }
    public void setDescpdt(String descpdt) { this.descpdt = descpdt; }

    public Integer getPrixpdt() { return prixpdt; }
    public void setPrixpdt(Integer prixpdt) { this.prixpdt = prixpdt; }

    public Integer getQteStock() { return qteStock; }
    public void setQteStock(Integer qteStock) { this.qteStock = qteStock; }
}
