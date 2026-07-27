package com.jec.cist.config;

import com.jec.cist.models.*;
import com.jec.cist.repositories.*;
import com.jec.cist.services.JwtService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataLoader implements CommandLineRunner {

    private final AulaAipRepository aulaAipRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final PersonalInstitucionalRepository personalInstitucionalRepository;
    private final EquipoAipRepository equipoAipRepository;
    private final SesionDetalleRepository sesionDetalleRepository;
    private final SesionGrupalRepository sesionGrupalRepository;
    private final JwtService jwtService;
    private final CursoRepository cursoRepository;
    private final CursoNotaRepository cursoNotaRepository;
    private final CursoMaterialRepository cursoMaterialRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final ConfiguracionRepository configuracionRepository;
    private final AnuncioRepository anuncioRepository;
    private final CalendarioEventoRepository calendarioEventoRepository;
    private final DebateRepository debateRepository;
    private final DebateRespuestaRepository debateRespuestaRepository;
    private final MensajeDirectoRepository mensajeDirectoRepository;
    private final CursoGrupoRepository cursoGrupoRepository;
    private final EstudianteLogroRepository estudianteLogroRepository;
    private final PreguntaJuegoRepository preguntaJuegoRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DataLoader(
            AulaAipRepository aulaAipRepository,
            UsuarioRepository usuarioRepository,
            EstudianteRepository estudianteRepository,
            PersonalInstitucionalRepository personalInstitucionalRepository,
            EquipoAipRepository equipoAipRepository,
            SesionDetalleRepository sesionDetalleRepository,
            SesionGrupalRepository sesionGrupalRepository,
            JwtService jwtService,
            CursoRepository cursoRepository,
            CursoNotaRepository cursoNotaRepository,
            CursoMaterialRepository cursoMaterialRepository,
            AsistenciaRepository asistenciaRepository,
            ConfiguracionRepository configuracionRepository,
            AnuncioRepository anuncioRepository,
            CalendarioEventoRepository calendarioEventoRepository,
            DebateRepository debateRepository,
            DebateRespuestaRepository debateRespuestaRepository,
            MensajeDirectoRepository mensajeDirectoRepository,
            CursoGrupoRepository cursoGrupoRepository,
            EstudianteLogroRepository estudianteLogroRepository,
            PreguntaJuegoRepository preguntaJuegoRepository) {
        this.aulaAipRepository = aulaAipRepository;
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.personalInstitucionalRepository = personalInstitucionalRepository;
        this.equipoAipRepository = equipoAipRepository;
        this.sesionDetalleRepository = sesionDetalleRepository;
        this.sesionGrupalRepository = sesionGrupalRepository;
        this.jwtService = jwtService;
        this.cursoRepository = cursoRepository;
        this.cursoNotaRepository = cursoNotaRepository;
        this.cursoMaterialRepository = cursoMaterialRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.configuracionRepository = configuracionRepository;
        this.anuncioRepository = anuncioRepository;
        this.calendarioEventoRepository = calendarioEventoRepository;
        this.debateRepository = debateRepository;
        this.debateRespuestaRepository = debateRespuestaRepository;
        this.mensajeDirectoRepository = mensajeDirectoRepository;
        this.cursoGrupoRepository = cursoGrupoRepository;
        this.estudianteLogroRepository = estudianteLogroRepository;
        this.preguntaJuegoRepository = preguntaJuegoRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Eliminar la restricción check obsoleta de tipo_equipo si existe en PostgreSQL
        try {
            entityManager.createNativeQuery("ALTER TABLE equipos_aip DROP CONSTRAINT IF EXISTS equipos_aip_tipo_equipo_check").executeUpdate();
            System.out.println("Restricción check de tipo_equipo eliminada/actualizada con éxito.");
        } catch (Exception e) {
            System.out.println("No se pudo alterar la restricción de tipo_equipo (ignorar si no es PostgreSQL): " + e.getMessage());
        }

        // Ejecutar la limpieza general únicamente si el sistema no se ha marcado como limpio/producción
        if (!configuracionRepository.existsById("SYSTEM_CLEANED")) {
            System.out.println("========== EJECUTANDO LIMPIEZA ÚNICA DE BASE DE DATOS PARA LANZAMIENTO OFICIAL ==========");

            // 1. Eliminar registros de sesiones
            sesionDetalleRepository.deleteAllInBatch();
            sesionGrupalRepository.deleteAllInBatch();

            // 2. Eliminar asistencias
            asistenciaRepository.deleteAllInBatch();

            // 2b. Eliminar registros del Aula Virtual para evitar violaciones de clave foránea en Cursos
            debateRespuestaRepository.deleteAllInBatch();
            debateRepository.deleteAllInBatch();
            mensajeDirectoRepository.deleteAllInBatch();
            cursoGrupoRepository.deleteAllInBatch();
            estudianteLogroRepository.deleteAllInBatch();
            anuncioRepository.deleteAllInBatch();
            calendarioEventoRepository.deleteAllInBatch();

            // 3. Eliminar notas, materiales y cursos
            cursoNotaRepository.deleteAllInBatch();
            cursoMaterialRepository.deleteAllInBatch();
            cursoRepository.deleteAllInBatch();

            // 4. Eliminar hardware/equipos y aulas
            equipoAipRepository.deleteAllInBatch();
            aulaAipRepository.deleteAllInBatch();

            // 5. Eliminar perfiles de estudiantes y personal
            estudianteRepository.deleteAllInBatch();
            personalInstitucionalRepository.deleteAllInBatch();

            // 6. Eliminar todos los usuarios
            usuarioRepository.deleteAllInBatch();

            // 7. Eliminar configuraciones antiguas
            configuracionRepository.deleteAllInBatch();

            // Reiniciar la secuencia de la tabla de aulas para que empiece en 1 (PostgreSQL)
            try {
                entityManager.createNativeQuery("ALTER SEQUENCE aulas_aip_id_aula_seq RESTART WITH 1").executeUpdate();
                System.out.println("Secuencia de Aulas AIP reiniciada con éxito.");
            } catch (Exception e) {
                System.out.println("No se pudo reiniciar la secuencia de aulas (ignorar si no es PostgreSQL): " + e.getMessage());
            }

            System.out.println("========== LIMPIEZA COMPLETADA. SEMBRANDO USUARIO CIST Y CONFIGURACIONES OFICIALES ==========");

            // 8. Crear Administrador CIST (Eddam)
            String cistDni = "75731461";
            Usuario cist = new Usuario();
            cist.setDni(cistDni);
            cist.setNombres("Eddam Eloy");
            cist.setApellidos("Huallpa Lima");
            cist.setRol(Rol.CIST);
            cist.setQrToken("TEMP-CIST");
            cist = usuarioRepository.saveAndFlush(cist);

            String cistQr = jwtService.generateUserShortToken(cistDni);
            cist.setQrToken(cistQr);
            cist = usuarioRepository.save(cist);

            PersonalInstitucional personalCist = new PersonalInstitucional(cist, "COORDINADOR CIST", "SOPORTE TECNOLOGICO");
            personalInstitucionalRepository.save(personalCist);

            // 8b. Crear Aulas AIP por defecto (necesarias para el estado de red y préstamos)
            aulaAipRepository.save(new AulaAip("AIP 01 - Principal", EstadoRed.ONLINE)); // ID 1
            aulaAipRepository.save(new AulaAip("AIP 02", EstadoRed.ONLINE)); // ID 2
            aulaAipRepository.save(new AulaAip("AIP 03", EstadoRed.ONLINE)); // ID 3

            // 9. Crear configuraciones de horarios por defecto
            configuracionRepository.save(new Configuracion("ATTENDANCE_START_TIME", "07:30:00"));
            configuracionRepository.save(new Configuracion("ATTENDANCE_LATE_TIME", "07:45:00"));

            // 10. Marcar base de datos como limpia para producción
            configuracionRepository.save(new Configuracion("SYSTEM_CLEANED", "true"));

            System.out.println("\n--- CREDENCIALES DEL CIST CONSERVADO ---");
            System.out.println("Nombre: Eddam Eloy Huallpa Lima");
            System.out.println("DNI: " + cistDni);
            System.out.println("Rol: CIST (Administrador Único)");
            System.out.println("----------------------------------------\n");

            System.out.println("========== SISTEMA PREPARADO Y LIMPIO PARA PRODUCCIÓN ==========");
        } else {
            System.out.println("========== SISTEMA EN PRODUCCIÓN. SE EVITÓ LA LIMPIEZA DE DATOS ==========");
        }

        // Sembrar preguntas para el juego si está vacío
        sembrarPreguntasSiVacio();
    }

    @Transactional
    public void sembrarPreguntasSiVacio() {
        try {
            if (preguntaJuegoRepository.count() == 0) {
                System.out.println("========== SEMBRANDO PREGUNTAS PREDETERMINADAS PARA JUEGOS ==========");
                org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("import_preguntas.sql");
                java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(resource.getInputStream(), java.nio.charset.StandardCharsets.UTF_8));
                String sql = reader.lines().collect(java.util.stream.Collectors.joining("\n"));
                
                String[] queries = sql.split(";");
                int ejecutados = 0;
                for (String query : queries) {
                    String qTrim = query.trim();
                    if (!qTrim.isEmpty() && !qTrim.startsWith("--")) {
                        entityManager.createNativeQuery(qTrim).executeUpdate();
                        ejecutados++;
                    }
                }
                System.out.println("Se sembraron " + ejecutados + " preguntas predeterminadas con éxito.");
            }
        } catch (Exception e) {
            System.err.println("Error al sembrar preguntas predeterminadas: " + e.getMessage());
        }
    }
}
