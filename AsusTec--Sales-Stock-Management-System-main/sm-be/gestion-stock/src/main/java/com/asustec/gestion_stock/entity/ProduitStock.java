package com.asustec.gestion_stock.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "produits_stock")
public class ProduitStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer codestock;

    private Integer codepdt;
    private Integer qtepdt;


    public Integer getCodestock() {
        return codestock;
    }

    public void setCodestock(Integer codestock) {
        this.codestock = codestock;
    }

    public Integer getCodepdt() {
        return codepdt;
    }

    public void setCodepdt(Integer codepdt) {
        this.codepdt = codepdt;
    }

    public Integer getQtepdt() {
        return qtepdt;
    }

    public void setQtepdt(Integer qtepdt) {
        this.qtepdt = qtepdt;
    }
}

