package com.asustec.gestion_commercial.service;

import com.asustec.gestion_commercial.entity.ProduitPrix;
import com.asustec.gestion_commercial.entity.TousCommande;
import com.asustec.gestion_commercial.repository.ProduitPrixRepository;
import com.asustec.gestion_commercial.repository.TousCommandeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommercialService {

    private final ProduitPrixRepository produitRepo;
    private final TousCommandeRepository commandeRepo;

    public CommercialService(ProduitPrixRepository produitRepo,
                             TousCommandeRepository commandeRepo) {
        this.produitRepo = produitRepo;
        this.commandeRepo = commandeRepo;
    }

    public List<ProduitPrix> findAllProduits() {
        return produitRepo.findAll();
    }

    public ProduitPrix saveProduit(ProduitPrix produit) {
        return produitRepo.save(produit);
    }

    public TousCommande saveCommande(TousCommande commande) {
        return commandeRepo.save(commande);
    }
}
