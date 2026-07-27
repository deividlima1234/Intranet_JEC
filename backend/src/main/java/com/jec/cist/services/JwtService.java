package com.jec.cist.services;

import com.jec.cist.models.Rol;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    // Clave por defecto de 256 bits para desarrollo
    @Value("${app.jwt.secret:HuanoquiteJecSecretKey2026SecureStringForIntranetToken}")
    private String jwtSecret;

    // Los QR no expiran o expiran en muchos años, ya que son fotochecks impresos físicamente.
    // Expira en 10 años (315360000000 milisegundos).
    private static final long EXPIRATION_TIME = 315360000000L;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String generateHmacSignature(String input) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(getSigningKey());
            byte[] hmacBytes = mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 6; i++) { // Tomamos los primeros 6 bytes -> 12 caracteres hexadecimales
                sb.append(String.format("%02x", hmacBytes[i]));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar firma HMAC", e);
        }
    }

    public String generateUserShortToken(String dni) {
        return dni + ":" + generateHmacSignature(dni);
    }

    public boolean validateShortToken(String token) {
        if (token == null || !token.contains(":")) {
            return false;
        }
        String[] parts = token.split(":");
        if (parts.length != 2) {
            return false;
        }
        String dni = parts[0];
        String signature = parts[1];
        return signature.equals(generateHmacSignature(dni));
    }

    public String generateUserQrToken(UUID idUsuario, String dni, Rol rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("dni", dni);
        claims.put("rol", rol.name());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .claims(claims)
                .subject(idUsuario.toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateQrToken(String token) {
        try {
            if (token == null) return false;
            if (token.contains(":")) {
                return validateShortToken(token);
            }
            Claims claims = extractAllClaims(token);
            return claims.getSubject() != null && 
                   claims.get("dni") != null && 
                   claims.get("rol") != null &&
                   !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public UUID extractUsuarioId(String token) {
        Claims claims = extractAllClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    public String extractDni(String token) {
        if (token == null) return null;
        if (token.contains(":")) {
            return token.split(":")[0];
        }
        Claims claims = extractAllClaims(token);
        return claims.get("dni", String.class);
    }

    public Rol extractRol(String token) {
        Claims claims = extractAllClaims(token);
        return Rol.valueOf(claims.get("rol", String.class));
    }
}
