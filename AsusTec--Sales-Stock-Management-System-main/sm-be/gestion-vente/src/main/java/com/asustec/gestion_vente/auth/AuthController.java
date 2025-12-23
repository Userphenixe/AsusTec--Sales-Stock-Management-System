package com.asustec.gestion_vente.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtEncoder jwtEncoder;

    @Value("${jwt.issuer}")
    private String issuer;

    public AuthController(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    /**
     * Accepts BOTH:
     * - JSON: {"username":"admin","password":"admin"}
     * - Form: username=admin&password=admin (application/x-www-form-urlencoded)
     */
    @PostMapping(value = "/login", consumes = {
            MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_FORM_URLENCODED_VALUE
    })
    public ResponseEntity<?> login(
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password
    ) {
        String u = (body != null && body.get("username") != null) ? body.get("username") : username;
        String p = (body != null && body.get("password") != null) ? body.get("password") : password;

        u = (u == null) ? "" : u.trim();
        p = (p == null) ? "" : p.trim();

        if (u.isBlank() || p.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "username/password required"));
        }

        // Demo credentials
        if (!"admin".equals(u) || !"admin".equals(p)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plus(2, ChronoUnit.HOURS))
                .subject(u)
                .claim("role", "ADMIN")
                .build();

        // IMPORTANT: force HS256 + kid to match the JWK in JwtConfig
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256)
                .keyId("sm-be-hs256")
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return ResponseEntity.ok(Map.of(
                "access_token", token,
                "token_type", "Bearer"
        ));
    }
}
