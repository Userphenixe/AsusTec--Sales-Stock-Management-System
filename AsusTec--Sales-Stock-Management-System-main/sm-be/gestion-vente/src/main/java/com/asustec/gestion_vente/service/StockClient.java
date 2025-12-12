package com.asustec.gestion_vente.service;

import com.asustec.gestion_vente.dto.ProduitStockDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class StockClient {

    private final WebClient webClient;

    public StockClient(@Value("${asustec.stock-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public List<ProduitStockDto> getStock() {
        return webClient.get()
                .uri("/produits")
                .retrieve()
                .bodyToFlux(ProduitStockDto.class)
                .collectList()
                .block();
    }

    public void subtractStock(Integer codePdt, Integer qteCmd) {
        // on envoie le JSON { "codePdt": X, "qteCmd": Y }
        var request = new java.util.HashMap<String, Object>();
        request.put("codePdt", codePdt);
        request.put("qteCmd", qteCmd);

        webClient.post()
                .uri("/soustraire")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}
