package com.asustec.gestion_stock.web;

public class SoustractionRequest {

    private Integer codePdt;
    private Integer qteCmd;

    public Integer getCodePdt() {
        return codePdt;
    }

    public void setCodePdt(Integer codePdt) {
        this.codePdt = codePdt;
    }

    public Integer getQteCmd() {
        return qteCmd;
    }

    public void setQteCmd(Integer qteCmd) {
        this.qteCmd = qteCmd;
    }
}
