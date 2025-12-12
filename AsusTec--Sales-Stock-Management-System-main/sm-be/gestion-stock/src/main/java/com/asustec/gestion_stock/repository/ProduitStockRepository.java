package com.asustec.gestion_stock.repository;

import com.asustec.gestion_stock.entity.ProduitStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProduitStockRepository extends JpaRepository<ProduitStock, Integer> {
    Optional<ProduitStock> findByCodepdt(Integer codepdt);
}
