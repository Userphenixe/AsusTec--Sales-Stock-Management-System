package com.asustec.gestion_commercial.repository;

import com.asustec.gestion_commercial.entity.TousCommande;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TousCommandeRepository extends JpaRepository<TousCommande, Integer> {
}
