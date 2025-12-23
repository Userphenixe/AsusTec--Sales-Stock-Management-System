package com.asustec.gestion_commercial.web;

import com.asustec.gestion_commercial.entity.ProduitPrix;
import com.asustec.gestion_commercial.entity.TousCommande;
import com.asustec.gestion_commercial.service.CommercialService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/commercial")
public class CommercialController {

    private final CommercialService service;

    public CommercialController(CommercialService service) {
        this.service = service;
    }

    // GET /api/commercial/produits
    @GetMapping("/produits")
    public List<ProduitPrix> getAllProduits() {
        return service.findAllProduits();
    }

    @PostMapping("/produits")
    public ProduitPrix addProduit(@RequestBody ProduitPrix pdt) {
        return service.saveProduit(pdt);
    }

    // POST /api/commercial/commandes
    @PostMapping("/commandes")
    public TousCommande addCommande(@RequestBody TousCommande commande) {
        if (commande.getDatecmd() == null) {
            commande.setDatecmd(LocalDate.now());
        }
        return service.saveCommande(commande);
    }
}
