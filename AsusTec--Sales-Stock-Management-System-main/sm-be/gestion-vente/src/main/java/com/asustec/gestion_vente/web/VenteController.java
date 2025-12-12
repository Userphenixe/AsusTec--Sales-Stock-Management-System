package com.asustec.gestion_vente.web;

import com.asustec.gestion_vente.dto.LigneFactureDto;
import com.asustec.gestion_vente.dto.ProduitDto;
import com.asustec.gestion_vente.entity.Commande;
import com.asustec.gestion_vente.service.VenteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventes")
public class VenteController {

    private final VenteService venteService;

    public VenteController(VenteService venteService) {
        this.venteService = venteService;
    }

    // GET /api/ventes/produits
    @GetMapping("/produits")
    public List<ProduitDto> getProduits() {
        return venteService.getProduitsAvecStock();
    }

    // POST /api/ventes/commande
    @PostMapping("/commande")
    public LigneFactureDto passerCommande(@RequestBody CommandeRequest request) {
        return venteService.passerCommande(
                request.getClient(),
                request.getCodePdt(),
                request.getQteCmd()
        );
    }

    // GET /api/ventes/commandes
    @GetMapping("/commandes")
    public List<Commande> getCommandes() {
        return venteService.getAllCommandes();
    }
}
