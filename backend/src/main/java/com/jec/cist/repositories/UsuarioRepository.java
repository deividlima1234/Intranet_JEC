package com.jec.cist.repositories;

import com.jec.cist.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByDni(String dni);
    Optional<Usuario> findByQrToken(String qrToken);
    boolean existsByDni(String dni);
    boolean existsByQrToken(String qrToken);
    java.util.List<Usuario> findByRol(com.jec.cist.models.Rol rol);
}
