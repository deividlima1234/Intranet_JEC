package com.jec.cist.controllers;

import com.jec.cist.services.MigracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/migracion")
public class MigracionController {

    @Autowired
    private MigracionService migracionService;

    @PostMapping("/ejecutar")
    public ResponseEntity<Map<String, Object>> ejecutarMigracion() {
        Map<String, Object> resultado = migracionService.ejecutarMigracion();
        return ResponseEntity.ok(resultado);
    }
}
