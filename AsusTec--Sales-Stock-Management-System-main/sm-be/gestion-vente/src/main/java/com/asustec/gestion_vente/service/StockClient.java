package com.asustec.gestion_vente.service;

import com.asustec.gestion_vente.dto.ProduitStockDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StockClient {

    private final WebClient webClient;

    public StockClient(@Value("${asustec.stock-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public List<ProduitStockDto> getStock(String authHeader) {
        var request = webClient.get().uri("/produits");

        if (authHeader != null && !authHeader.isBlank()) {
            request = request.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return request
                .retrieve()
                .bodyToFlux(ProduitStockDto.class)
                .collectList()
                .block();
    }

    public void subtractStock(Integer codePdt, Integer qteCmd, String authHeader) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("codePdt", codePdt);
        requestBody.put("qteCmd", qteCmd);

        var request = webClient.post()
                .uri("/soustraire")
                .bodyValue(requestBody);

        if (authHeader != null && !authHeader.isBlank()) {
            request = request.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        request.retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}
