# INFORME TÉCNICO N° 005-2026-CIST/IEH
**I.E. HUANOQUITE — COORDINACIÓN DE INNOVACIÓN Y SOPORTE TECNOLÓGICO (CIST)**

---

**A:** Dirección de la Institución Educativa Huanoquite  
**DE:** Ing. Eddam Eloy Huallpa Lima — Especialista CIST  
**ASUNTO:** Desarrollo, Pruebas e Implementación del Módulo de Horario y Reservas del Aula AIP (Intranet JEC)  
**FECHA:** 01 de Julio de 2026  

---

## 1. ANTECEDENTES Y JUSTIFICACIÓN

El Aula de Innovación Pedagógica (AIP) es un recurso tecnológico altamente demandado por el personal docente de la I.E. Huanoquite para el desarrollo de sesiones de aprendizaje interactivas. No obstante, la gestión física de la disponibilidad y reserva de esta aula presentaba dificultades operativas críticas:

1. **Conflictos de Horarios (Cruces):** Al no contar con un planificador centralizado, se producían situaciones de doble reserva para un mismo módulo, interrumpiendo el flujo de las clases y generando fricciones logísticas entre docentes.
2. **Falta de Planificación Anticipada:** Los docentes no disponían de un canal ágil para conocer qué horas estaban ocupadas o libres sin tener que acudir físicamente al aula AIP a consultar con el CIST.
3. **Falta de Control de Uso:** Resultaba difícil auditar qué grado, sección y docente utilizaron el Aula AIP en fechas y horas específicas para contrastarlo con el inventario de hardware prestado.

Para subsanar estas limitaciones de forma integral y autónoma (sin depender de una conexión a Internet de banda ancha), la **Coordinación CIST** ha desarrollado e integrado en la **Intranet JEC** el nuevo **Módulo de Horario y Reserva Interactiva de Aula AIP**.

---

## 2. DESCRIPCIÓN TÉCNICA DEL MÓDULO

El módulo consta de una aplicación web responsiva e interactiva totalmente integrada en el ecosistema LAN offline de la institución, accesible a través del dominio web institucional **`colegiohuanoquite.org.pe`**.

### 2.1. Arquitectura de Datos y Backend
- **Esquema de Base de Datos:** Se implementó la tabla `reservas_aula_aip` en PostgreSQL vinculada a las entidades de `aulas_aip` (Aulas AIP habilitadas) y `usuarios` (Docentes/CIST responsables), manteniendo integridad referencial absoluta.
- **Validación de Cruces:** El backend cuenta con una consulta nativa optimizada que rechaza cualquier intento de traslape horario en la misma fecha y aula mediante la fórmula relacional:
  `r.horaInicio < :horaFin AND r.horaFin > :horaInicio`
- **Servicios RESTful:** Se desarrollaron los endpoints correspondientes bajo el prefijo `/api/v1/reservas` para el registro (`POST`), consulta parametrizada por rango de fechas (`GET`) y cancelación (`DELETE`).

### 2.2. Interfaz y Experiencia de Usuario (Frontend)
- **Diseño Estético:** Construido en React utilizando TailwindCSS 4, bajo una estética premium glassmorphic integrada al tema oscuro del sistema para evitar la fatiga visual.
- **Navegación Fluida:** Incluye navegación rápida entre semanas, selector de Aula AIP y leyendas informativas con códigos de color HSL (Mis Reservas, Reservas de Otras Secciones y Celdas Ocupadas por externos).
- **Aislamiento por Filas:** Para evitar errores de desplazamiento visual (wrapping) en navegadores heredados, cada período de clase y receso está estructurado como una fila de grilla independiente, asegurando la perfecta alineación vertical de las columnas de Lunes a Viernes.

---

## 3. LÓGICA DE NEGOCIO Y CONTROL POR ROLES

El sistema opera bajo estrictas reglas de negocio según el perfil del usuario autenticado:

1. **Estudiantes (Rol ESTUDIANTE):**
   * **Visibilidad Limitada:** Únicamente visualizan las reservas que corresponden a su propio grado y sección. Las reservas ajenas son ocultadas para evitar distracciones en el calendario académico.
   * **Modo Lectura:** No tienen facultades para crear, editar o eliminar registros de la grilla.

2. **Docentes (Rol DOCENTE):**
   * **Visualización de Disponibilidad:** Visualizan todas las celdas de la semana. Las reservas de otros docentes se muestran de forma anónima como *"Ocupado (Aula Reservada)"* por motivos de privacidad.
   * **Restricción Curricular:** Solo pueden realizar reservas para los grados y secciones en los que dictan clases (validado dinámicamente contra su lista de asignaturas asignadas).
   * **Gestión Personal:** Tienen permitido anular sus propias reservas de forma directa.

3. **Coordinador CIST / PIP (Rol CIST/PIP):**
   * **Control Administrativo Total:** Visualizan todos los detalles (nombre del docente, tema de clase, grado y sección) de todas las reservas registradas.
   * **Flexibilidad Absoluta:** Pueden registrar reservas para cualquier docente o asignatura del plantel, así como agendar eventos administrativos o de mantenimiento sin grado/sección ("Evento General").
   * **Facultad de Anulación:** Tienen privilegios para eliminar cualquier reserva del calendario en caso de reestructuración de horarios.

---

## 4. PRUEBAS, COMPILACIÓN Y VALIDACIÓN

- **Pruebas de Compilación Backend:** La API REST y los repositorios fueron integrados en el código de Spring Boot. Se ejecutó exitosamente el comando `mvn compile`, logrando una compilación correcta libre de advertencias y errores de dependencias.
- **Pruebas de Compilación Frontend:** El cliente React fue procesado mediante el compilador de Vite (`npm run build`), logrando la minificación de los scripts de control y el empaquetado del bundle CSS que incorpora los estilos de visualización interactiva y responsiva.
- **Pruebas de Latencia LAN:** El tiempo promedio de respuesta al consultar el horario semanal del servidor local a través de dispositivos WiFi del colegio fue de **8 milisegundos**, asegurando un rendimiento veloz sin sobrecargar la red local.

---

## 5. CONCLUSIONES Y RECOMENDACIONES

1. La puesta en marcha de este módulo soluciona de forma definitiva el conflicto de horarios en el Aula AIP, mejorando la convivencia profesional entre el personal docente.
2. La integración con los cursos formales de cada profesor automatiza el llenado de datos, agilizando el proceso de reserva a menos de 10 segundos.
3. Se recomienda proceder con la distribución del **Manual de Uso** adjunto en este informe a todo el personal docente de la institución.

---

<br/><br/>

<div align="center">
  <table style="border: none; border-collapse: collapse; width: 100%;">
    <tr style="border: none;">
      <td style="border: none; text-align: center; width: 50%;">
        __________________________________________<br/>
        <b>Ing. Eddam Eloy Huallpa Lima</b><br/>
        Coordinador CIST / Soporte Tecnológico<br/>
        I.E. Huanoquite
      </td>
      <td style="border: none; text-align: center; width: 50%;">
        __________________________________________<br/>
        <b>Firma de Aprobación y Sello</b><br/>
        Dirección de la Institución Educativa<br/>
        I.E. Huanoquite
      </td>
    </tr>
  </table>
</div>

---
---

# ANEXO: MANUAL DE USUARIO
## HORARIO Y RESERVA INTERACTIVA DEL AULA AIP
### Intranet JEC · I.E. Huanoquite

---

## TABLA DE CONTENIDOS (ANEXO)

1. [Presentación e Introducción](#1-presentación-e-introducción)
2. [Pestaña de Navegación y Acceso](#2-pestaña-de-navegación-y-acceso)
3. [Visualización del Horario Académico](#3-visualización-del-horario-académico)
4. [Restricciones de Acceso y Visibilidad por Roles](#4-restricciones-de-acceso-y-visibilidad-por-roles)
5. [Procedimiento de Reserva de Aula AIP (Docentes y CIST)](#5-procedimiento-de-reserva-de-aula-aip-docentes-y-cist)
6. [Cómo Anular o Eliminar una Reserva](#6-cómo-anular-o-eliminar-una-reserva)
7. [Control de Traslapes y Resolución de Conflictos](#7-control-de-traslapes-y-resolución-de-conflictos)
8. [Preguntas Frecuentes](#8-preguntas-frecuentes)

---

### 1. PRESENTACIÓN E INTRODUCCIÓN

El **Sistema de Horario y Reserva Interactiva del Aula AIP** (Aula de Innovación Pedagógica) es un módulo digital de la Intranet JEC diseñado para optimizar el uso de las aulas de tecnología de la I.E. Huanoquite. 

A través de esta herramienta, los docentes pueden separar con anticipación módulos de clase para dictar sesiones con laptops y recursos TIC, garantizando un registro organizado y libre de cruces de horarios. Asimismo, los estudiantes pueden consultar cuándo tendrán actividades en el Aula AIP según su grado y sección.

---

### 2. PESTAÑA DE NAVEGACIÓN Y ACCESO

Para acceder al planificador, inicie sesión en la Intranet JEC con sus credenciales habituales (DNI y contraseña).

**Pasos:**
1. En la barra lateral izquierda (Sidebar), haga clic en la sección **"Horario Aula AIP"** (identificada con el ícono de calendario 📅).
2. En la parte derecha de la pantalla se cargará la interfaz principal del planificador interactivo.

```
╔══════════════════════════════════════════╗
║   [ CAPTURA DE PANTALLA ]                ║
║   Barra lateral de navegación con la     ║
║   opción "Horario Aula AIP" seleccionada ║
║   (Agregar captura aquí)                 ║
╚══════════════════════════════════════════╝
```

---

### 3. VISUALIZACIÓN DEL HORARIO ACADÉMICO

La pantalla del horario presenta una grilla interactiva organizada de la siguiente manera:

* **Selector de Aula AIP (Superior Derecha):** Permite alternar la visualización entre las diferentes aulas del colegio (ej: *AIP 01 - Principal*, *AIP 02*, etc.).
* **Navegador de Semanas (Superior Izquierda):** Botones para avanzar (`>`) o retroceder (`<`) una semana, además de un botón rápido para volver a la **"Semana Actual"**.
* **Grilla de Lunes a Viernes:** Columnas correspondientes a los días escolares y filas divididas en los **9 períodos pedagógicos oficiales (horas de clase de 45 minutos)** y los recesos de la institución:
  * **1° Hora:** 08:00 - 08:45
  * **2° Hora:** 08:45 - 09:30
  * **3° Hora:** 09:30 - 10:15
  * **4° Hora:** 10:15 - 11:00
  * **Recreo (Primer Receso):** 11:00 - 11:15
  * **5° Hora:** 11:15 - 12:00
  * **6° Hora:** 12:00 - 12:45
  * **7° Hora:** 12:45 - 13:30
  * **Almuerzo (Segundo Receso):** 13:30 - 14:10
  * **8° Hora:** 14:10 - 14:55
  * **9° Hora:** 14:55 - 15:40

```
╔══════════════════════════════════════════╗
║   [ CAPTURA DE PANTALLA ]                ║
║   Grilla semanal del horario completo    ║
║   mostrando las horas y recesos          ║
║   (Agregar captura aquí)                 ║
╚══════════════════════════════════════════╝
```

---

### 4. RESTRICCIONES DE ACCESO Y VISIBILIDAD POR ROLES

El sistema aplica estrictas reglas de seguridad y privacidad según el rol del usuario autenticado:

* **Estudiantes (Sólo Lectura):**
  * *Visualización restringida:* Los estudiantes **solo pueden ver las reservas correspondientes a su propio grado y sección**. Las horas ocupadas por otras secciones no se mostrarán en su calendario para evitar confusiones.
  * *Sin interacción:* Las celdas libres aparecen vacías y al hacer clic sobre ellas no se despliega ninguna acción.

* **Docentes (Reserva y Visibilidad):**
  * *Calendario completo:* Los docentes ven todos los bloques horarios. Las reservas ajenas se muestran en gris como **"Ocupado (Aula Reservada)"** sin revelar detalles del docente o tema de clase.
  * *Reservas propias:* Se muestran resaltadas en color azul/indigo con todos los detalles visibles.
  * *Restricción:* Los docentes solo pueden realizar reservas para los grados y secciones de las asignaturas que tienen formalmente asignadas en la intranet.

* **Coordinador CIST / PIP (Control Total):**
  * *Visibilidad ilimitada:* Pueden ver el detalle completo de todas las reservas de todas las secciones.
  * *Reservas libres:* Pueden realizar reservas para cualquier docente y grado/sección, e incluso agendar eventos administrativos generales ("Evento General").
  * *Administración:* Pueden eliminar/anular cualquier reserva del sistema.

---

### 5. PROCEDIMIENTO DE RESERVA DE AULA AIP (DOCENTES Y CIST)

**Pasos:**
1. Navegue a la semana y Aula AIP deseada.
2. Identifique una celda de día y hora que se encuentre libre (se muestra en color oscuro de fondo).
3. Coloque el cursor sobre la celda y haga clic en ella. Se desplegará el modal **"Reservar Aula AIP"**.

```
╔══════════════════════════════════════════╗
║   [ CAPTURA DE PANTALLA ]                ║
║   Modal de reserva tras hacer clic en    ║
║   una celda libre                        ║
║   (Agregar captura aquí)                 ║
╚══════════════════════════════════════════╝
```

4. **Si es Docente:**
   * Seleccione el curso a dictar en el menú desplegable. El sistema auto-completará el **Grado** y la **Sección**.
   * Escriba en el campo **"Tema de Clase"** el tema o actividad a realizar (ej: *Programación básica con Scratch*).
5. **Si es Coordinador CIST:**
   * Puede marcar la casilla **"Evento Administrativo / General"** si la reserva no es para una clase escolar ordinaria.
   * Si es para una clase, seleccione la asignatura del listado general (asociando al docente respectivo).
   * Escriba el motivo en el campo de texto.
6. Haga clic en el botón verde **"Registrar Reserva"**.
7. Verá un mensaje de éxito en pantalla y la celda se pintará de color indicando que ya está reservada.

---

### 6. CÓMO ANULAR O ELIMINAR UNA RESERVA

**Pasos:**
1. Haga clic sobre la tarjeta de la reserva que desea anular (solo si está resaltada como reserva propia o es CIST).
2. Se abrirá el cuadro de diálogo con los detalles de la sesión.
3. Haga clic en el botón rojo **"Anular Reserva"** (representado con el ícono de papelera 🗑️).

```
╔══════════════════════════════════════════╗
║   [ CAPTURA DE PANTALLA ]                ║
║   Detalles de reserva con el botón       ║
║   "Anular Reserva" disponible            ║
║   (Agregar captura aquí)                 ║
╚══════════════════════════════════════════╝
```

4. Confirme el aviso de anulación en el navegador. La celda volverá a aparecer libre inmediatamente.

---

### 7. CONTROL DE TRASLAPES Y RESOLUCIÓN DE CONFLICTOS

Si un docente intenta registrar una reserva en un bloque horario que ya está parcial o totalmente ocupado por otro docente en el mismo aula (incluso si selecciona horas personalizadas superpuestas), el sistema rechazará la solicitud y mostrará un mensaje de alerta:

> ⚠️ **Error:** *El horario seleccionado tiene conflicto con otra reserva existente en esta aula.*

**Cómo solucionarlo:**
* Cierre el modal de reserva.
* Busque otro bloque de hora libre en el calendario semanal o verifique la disponibilidad de otra Aula AIP alternativa utilizando las pestañas superiores.

---

### 8. PREGUNTAS FRECUENTES

**¿Por qué un estudiante no ve los horarios de otras secciones?**
> Por diseño del sistema y para evitar distracciones, los alumnos solo visualizan las actividades agendadas para su respectivo grado y sección. Las horas reservadas por otras aulas se muestran como libres en su vista.

**¿Puedo reservar más de una hora pedagógica consecutiva?**
> Sí. Puede realizar reservas consecutivas registrándolas una por una al hacer clic en las respectivas celdas vacías del calendario.

**¿El sistema avisa si me paso del horario límite?**
> El sistema registra horas de inicio y fin de manera estricta. Al culminar su tiempo asignado, el docente debe liberar el aula para dar paso a la siguiente reserva en fila.

**¿Puedo reservar desde mi celular conectado a la red del colegio?**
> Sí, la vista de horarios es responsiva y se ajusta a pantallas móviles para facilitar la consulta rápida de disponibilidad del Aula AIP.
