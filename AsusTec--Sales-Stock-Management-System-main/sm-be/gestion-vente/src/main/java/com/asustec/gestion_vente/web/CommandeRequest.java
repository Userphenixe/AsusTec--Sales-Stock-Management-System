package com.asustec.gestion_vente.web;

public class CommandeRequest {

    private String client;
    private Integer codePdt;
    private Integer qteCmd;

    public String getClient() { return client; }
    public void setClient(String client) { this.client = client; }

    public Integer getCodePdt() { return codePdt; }
    public void setCodePdt(Integer codePdt) { this.codePdt = codePdt; }

    public Integer getQteCmd() { return qteCmd; }
    public void setQteCmd(Integer qteCmd) { this.qteCmd = qteCmd; }
}
