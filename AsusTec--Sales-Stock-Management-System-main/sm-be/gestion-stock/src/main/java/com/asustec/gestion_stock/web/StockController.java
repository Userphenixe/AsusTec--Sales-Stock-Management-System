package com.asustec.gestion_stock.web;

import com.asustec.gestion_stock.entity.ProduitStock;
import com.asustec.gestion_stock.service.StockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService service;

    public StockController(StockService service) {
        this.service = service;
    }

    @PostMapping("/produits")
    public ProduitStock addStock(@RequestBody ProduitStock produitStock) {
        return service.saveProduitStock(produitStock);
    }


    // GET /api/stock/produits
    @GetMapping("/produits")
    public List<ProduitStock> getStock() {
        return service.getAll();
    }

    // POST /api/stock/soustraire?codePdt=X&qteCmd=Y
    @PostMapping("/soustraire")
    public ProduitStock soustraire(@RequestBody SoustractionRequest request) {
        return service.subtractQuantity(request.getCodePdt(), request.getQteCmd());
    }


}
