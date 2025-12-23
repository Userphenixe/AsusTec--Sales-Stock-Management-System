package com.asustec.gestion_vente.service;

import com.asustec.gestion_vente.dto.ProduitDto;
import com.asustec.gestion_vente.entity.Commande;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class CommercialClient {

    private final WebClient webClient;

    public CommercialClient(@Value("${asustec.commercial-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public List<ProduitDto> getAllProduits(String authHeader) {
        var request = webClient.get().uri("/produits");

        if (authHeader != null && !authHeader.isBlank()) {
            request = request.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return request
                .retrieve()
                .bodyToFlux(ProduitDto.class)
                .collectList()
                .block();
    }

    public void sendCommandeToCommercial(Commande cmd, String authHeader) {
        var request = webClient.post()
                .uri("/commandes")
                .bodyValue(cmd);

        if (authHeader != null && !authHeader.isBlank()) {
            request = request.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        request.retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}
