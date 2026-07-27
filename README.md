# Intranet JEC (Jornada Escolar Completa) 🏫💻

Bienvenido al repositorio oficial del proyecto **Intranet JEC**, un sistema de gestión educativa integral diseñado específicamente para el modelo de Jornada Escolar Completa (JEC) en colegios peruanos (como la Institución Educativa Huanoquite).

## 🚀 Sobre el Proyecto

La Intranet JEC es una plataforma integral orientada a modernizar y optimizar la gestión escolar, cerrando la brecha tecnológica en la administración académica. Conecta a Estudiantes, Docentes, CIST (Coordinadores de Innovación y Soporte Tecnológico) y Administradores en un ecosistema unificado.

### 🌟 Funcionalidades Principales

*   **Gestión de Cursos y Aulas:** Organización detallada de grados, secciones y materias.
*   **Aulas de Innovación (AIP):** Módulo dedicado al rol CIST para el control patrimonial de equipos (Laptops, Proyectores, etc.), reservas de salas y reportes de incidencias.
*   **Libro de Calificaciones Dinámico:** Sistema avanzado de evaluación por criterios y competencias. Los docentes pueden crear columnas de evaluación y calificar trabajos.
*   **Entregas y Avances Estudiantiles:** Los estudiantes pueden subir evidencias de sus trabajos, y los docentes pueden revisarlos y enlazarlos directamente al registro de notas.
*   **Sistema de Roles:** Acceso seguro basado en roles (ADMIN, DOCENTE, ESTUDIANTE, CIST).
*   **Comunicación:** Sistema de mensajería directa y anuncios (integrado).

---

## 🛠️ Stack Tecnológico

El proyecto está dividido en dos módulos principales integrados mediante una arquitectura Cliente-Servidor (REST API).

### 🖥️ Frontend (Cliente)
Aplicación moderna, reactiva y rápida para el usuario final.
*   **Framework:** React (Vite)
*   **Lenguaje:** JavaScript (ES6+)
*   **Estilos:** Tailwind CSS
*   **Estado & Data Fetching:** Hooks de React, Fetch API

### ⚙️ Backend (Servidor)
API robusta, tipada y segura para el manejo de la lógica de negocio y base de datos.
*   **Framework:** Spring Boot 3 (Java 17)
*   **Arquitectura:** MVC (Model-View-Controller)
*   **Persistencia:** Spring Data JPA / Hibernate
*   **Seguridad:** Spring Security con JWT (JSON Web Tokens)
*   **Base de Datos:** PostgreSQL 15+

---

## 🏗️ Estructura del Proyecto

```text
Intranet_JEC/
├── backend/          # Código fuente de Spring Boot (API)
│   ├── src/main/     # Controladores, Servicios, Modelos, Repositorios
│   └── pom.xml       # Dependencias de Maven
│
├── frontend/         # Código fuente de React (Vite)
│   ├── src/          # Componentes (Views, Modals, Hooks)
│   ├── public/       # Assets estáticos (Imágenes, PDFs de dotación)
│   └── package.json  # Dependencias de NPM
│
└── .gitignore        # Reglas de exclusión para GitHub
```

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para levantar el proyecto en tu entorno de desarrollo local.

### 1. Clonar el Repositorio
```bash
git clone git@github.com:deividlima1234/Intranet_JEC.git
cd Intranet_JEC
```

### 2. Configurar la Base de Datos (PostgreSQL)
1. Instala PostgreSQL y asegúrate de que esté corriendo.
2. Crea una base de datos llamada `intranet_jec`.
3. El backend está configurado por defecto para usar las credenciales estándar de PostgreSQL (usuario: `postgres`, contraseña: `postgres`), o se pueden configurar variables de entorno: `DB_USER`, `DB_PASSWORD`.
4. JPA está configurado con `update`, así que las tablas se crearán automáticamente al iniciar.

### 3. Ejecutar el Backend (Spring Boot)
Abre una terminal y navega a la carpeta del backend:
```bash
cd backend
./mvnw clean spring-boot:run
```
El servidor backend estará disponible en: `http://localhost:8080/api/v1/...`

### 4. Ejecutar el Frontend (React)
Abre una **nueva** terminal y navega a la carpeta del frontend:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web se abrirá automáticamente en tu navegador (por defecto `http://localhost:5173`).

---

## 🌍 Despliegue en Producción

El proyecto está preparado para correr en servidores Linux (Ubuntu/Debian) usando:
*   **Nginx** como Proxy Inverso para servir los estáticos del Frontend y redirigir el tráfico `/api/v1` al Backend.
*   **Systemd** para ejecutar el archivo `.jar` de Spring Boot como un servicio en segundo plano (`jec-backend.service`).
*   **Certbot (Let's Encrypt)** para seguridad SSL/HTTPS.

*Para redesplegar el backend en producción:*
```bash
cd backend
./mvnw clean package -DskipTests
sudo systemctl restart jec-backend.service
```

*Para redesplegar el frontend en producción:*
```bash
cd frontend
npm run build
# (Los archivos de producción se generan en la carpeta /dist)
```

---
*Desarrollado y mantenido para la innovación tecnológica en la Jornada Escolar Completa.*
