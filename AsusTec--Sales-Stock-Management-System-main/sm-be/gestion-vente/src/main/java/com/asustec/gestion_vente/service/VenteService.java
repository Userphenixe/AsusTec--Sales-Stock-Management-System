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


    public List<ProduitDto> getProduitsAvecStock() {
        List<ProduitDto> produits = commercialClient.getAllProduits();
        List<ProduitStockDto> stocks = stockClient.getStock();

        Map<Integer, Integer> mapStock = stocks.stream()
                .collect(Collectors.toMap(ProduitStockDto::getCodepdt,
                        ProduitStockDto::getQtepdt));

        produits.forEach(p -> p.setQteStock(mapStock.getOrDefault(p.getCodepdt(), 0)));
        return produits;
    }

    @Transactional
    public LigneFactureDto passerCommande(String client, Integer codePdt, Integer qteCmd) {

        // 1. récupérer les produits pour trouver celui demandé
        ProduitDto produit = commercialClient.getAllProduits().stream()
                .filter(p -> p.getCodepdt().equals(codePdt))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        // 2. décrémenter le stock
        stockClient.subtractStock(codePdt, qteCmd);

        // 3. enregistrer la commande côté g_vente
        Commande cmd = new Commande();
        cmd.setClient(client);
        cmd.setCodepdt(codePdt);
        cmd.setQtecmd(qteCmd);
        cmd.setDatecmd(LocalDate.now());
        cmd = commandeRepo.save(cmd);

        // 4. envoyer la commande au microservice commercial
        commercialClient.sendCommandeToCommercial(cmd);

        // 5. constituer la ligne de facture
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
