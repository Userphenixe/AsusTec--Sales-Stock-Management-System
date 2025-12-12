package com.asustec.gestion_stock.service;

import com.asustec.gestion_stock.entity.ProduitStock;
import com.asustec.gestion_stock.repository.ProduitStockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockService {

    private final ProduitStockRepository repo;

    public StockService(ProduitStockRepository repo) {
        this.repo = repo;
    }

    public List<ProduitStock> getAll() {
        return repo.findAll();
    }

    public ProduitStock saveProduitStock(ProduitStock ps) {
        return repo.save(ps);
    }

    @Transactional
    public ProduitStock subtractQuantity(Integer codepdt, Integer qteCmd) {
        ProduitStock ps = repo.findByCodepdt(codepdt)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé dans le stock"));
        if (ps.getQtepdt() < qteCmd) {
            throw new RuntimeException("Stock insuffisant");
        }
        ps.setQtepdt(ps.getQtepdt() - qteCmd);
        return ps;
    }
}
