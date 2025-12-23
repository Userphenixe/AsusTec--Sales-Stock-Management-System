package com.asustec.gestion_vente.repository;

import com.asustec.gestion_vente.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommandeRepository extends JpaRepository<Commande, Integer> {
}
