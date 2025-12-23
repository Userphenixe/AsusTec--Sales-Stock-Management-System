package com.asustec.gestion_vente.service;

import com.asustec.gestion_vente.dto.LigneFactureDto;
import com.asustec.gestion_vente.dto.ProduitDto;
import com.asustec.gestion_vente.dto.ProduitStockDto;
import com.asustec.gestion_vente.entity.Commande;
import com.asustec.gestion_vente.repository.CommandeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VenteService {

    private final CommandeRepository commandeRepo;
    private final CommercialClient commercialClient;
    private final StockClient stockClient;

    public VenteService(CommandeRepository commandeRepo,
                        CommercialClient commercialClient,
                        StockClient stockClient) {
        this.commandeRepo = commandeRepo;
        this.commercialClient = commercialClient;
        this.stockClient = stockClient;
    }

    public List<Commande> getAllCommandes() {
        return commandeRepo.findAll();
    }

    public List<ProduitDto> getProduitsAvecStock(String authHeader) {

        List<ProduitDto> produits = commercialClient.getAllProduits(authHeader);
        List<ProduitStockDto> stocks = stockClient.getStock(authHeader);

        Map<Integer, Integer> mapStock = stocks.stream()
                .collect(Collectors.toMap(
                        ProduitStockDto::getCodepdt,
                        ProduitStockDto::getQtepdt,
                        Integer::sum
                ));

        produits.forEach(p ->
                p.setQteStock(mapStock.getOrDefault(p.getCodepdt(), 0))
        );

        return produits;
    }

    @Transactional
    public LigneFactureDto passerCommande(
            String client,
            Integer codePdt,
            Integer qteCmd,
            String authHeader
    ) {

        ProduitDto produit = commercialClient.getAllProduits(authHeader).stream()
                .filter(p -> p.getCodepdt().equals(codePdt))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        stockClient.subtractStock(codePdt, qteCmd, authHeader);

        Commande cmd = new Commande();
        cmd.setClient(client);
        cmd.setCodepdt(codePdt);
        cmd.setQtecmd(qteCmd);
        cmd.setDatecmd(LocalDate.now());
        cmd = commandeRepo.save(cmd);

        commercialClient.sendCommandeToCommercial(cmd, authHeader);

        LigneFactureDto facture = new LigneFactureDto();
        facture.setCodecmd(cmd.getCodecmd());
        facture.setClient(client);
        facture.setCodepdt(codePdt);
        facture.setNompdt(produit.getNompdt());
        facture.setPrixpdt(produit.getPrixpdt());
        facture.setQtecmd(qteCmd);
        facture.setTotal(produit.getPrixpdt() * qteCmd);
        facture.setDatecmd(cmd.getDatecmd());

        return facture;
    }
}
