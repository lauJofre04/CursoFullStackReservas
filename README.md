# 🎓 DevCursos - Plataforma SaaS Educativa (LMS)

![Estado](https://img.shields.io/badge/Estado-Desplegado_en_Producci%C3%B3n-success)
![Java](https://img.shields.io/badge/Java-Spring_Boot_3-ED8B00?logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Clever_Cloud-316192?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-20232A?logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

DevCursos es una **Plataforma Integral de Cursos Online (SaaS)** desarrollada completamente desde cero. Transforma el concepto tradicional de un LMS en un modelo de negocio digital, gestionando la creación de contenido, los permisos de usuarios y la matriculación automática a través de pasarelas de pago reales.

Este proyecto fue diseñado con una arquitectura de software orientada a la escalabilidad, separando la lógica de negocio y seguridad en una API RESTful, y ofreciendo una Single Page Application (SPA) responsiva y moderna.

## 🚀 Demo en Vivo

La plataforma se encuentra completamente funcional y desplegada en la nube.
🔗 **Acceder a DevCursos: https://devcursos-lj.vercel.app/home

Para facilitar la revisión del sistema por parte de reclutadores y líderes técnicos, la base de datos cuenta con perfiles de prueba pre-cargados (no es necesario registrarse):

* 👑 **Administrador:** `admin@test.com` | Pass: `123456`
  *(Control total, finanzas, creación de cursos y asignación de roles)*
* 👨‍🏫 **Profesor:** `profe@test.com` | Pass: `123456`
  *(Gestión de contenido, módulos, exámenes y visualización de alumnos)*
* 🧑‍🎓 **Alumno:** `usuario@test.com` | Pass: `123456`
  *(Exploración del catálogo, experiencia de compra en Checkout Pro y Aula Virtual)*

## 💡 Características Principales

### 🛡️ Seguridad y Arquitectura
* **Control de Acceso Basado en Roles (RBAC):** Sistema de permisos estricto (Admin, Profesor, Alumno) gestionado mediante **JSON Web Tokens (JWT)**.
* **Escudo Anti-Ataques:** Implementación de **Bucket4j** para Rate Limiting, protegiendo los endpoints de autenticación contra ataques de fuerza bruta (DDoS).
* **Relaciones Complejas en BD:** Soporte para relaciones `ManyToMany`, permitiendo que un curso sea dictado por múltiples profesores simultáneamente.

### 💳 E-Commerce e Inscripciones
* **Pagos Reales:** Integración completa con el SDK de **Mercado Pago (Checkout Pro)**.
* **Procesamiento Asíncrono:** Implementación de **Webhooks** seguros (`external_reference`) para confirmar los pagos en tiempo real y automatizar la matriculación del alumno sin intervención humana.

### 📚 Experiencia Educativa (Aula Virtual)
* **Gestión Jerárquica:** Creación de contenido en estructura de árbol (Módulos -> Lecciones -> Recursos multimedia).
* **Motor de Evaluaciones:** Creación de exámenes dinámicos tipo *Multiple Choice* con calificación automática provista por el backend.
* **Navegación Fluida:** Barra lateral dinámica en React para alternar entre lecciones sin recargas de página.

## 🛠️ Stack Tecnológico e Infraestructura

**Frontend (Desplegado en Vercel):**
* React (Vite) / React Router DOM
* Tailwind CSS
* Axios

**Backend (Desplegado en Render):**
* Java 17+ / Spring Boot 3
* Spring Security & JWT
* Spring Data JPA / Hibernate
* Manejo Global de Excepciones (`@ControllerAdvice`)

**Base de Datos y Herramientas:**
* PostgreSQL (Desplegado en Clever Cloud)
* Mercado Pago API

## ⚙️ Instalación y Configuración Local

Si deseas auditar o correr este proyecto en tu entorno de desarrollo:

1. **Clonar el repositorio:**
   `git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git`

2. **Levantar el Backend:**
   * Configura las variables de entorno en tu IDE o en `application.properties` (Credenciales de BD, `JWT_SECRET`, y `MP_ACCESS_TOKEN`).
   * Ejecuta: `mvn spring-boot:run`
   * *Nota: El proyecto incluye un Data Seeder protegido por `@Profile("dev")` que poblará la base de datos automáticamente en tu máquina local.*

3. **Levantar el Frontend:**
   * Instala las dependencias: `npm install`
   * Inicia el servidor: `npm run dev`

## 🗺️ Roadmap (Próximos Pasos)
- [ ] **Observabilidad:** Integración de Sentry para el monitoreo de errores en tiempo real y logs en producción.
- [ ] **Fricción Cero:** Autenticación social (OAuth2) para permitir "Continuar con Google".
- [ ] **Búsqueda Avanzada:** Implementación de Fuzzy Search para tolerancia a errores tipográficos en el buscador de cursos.
- [ ] **Notificaciones:** Integración de WebSockets para alertas en tiempo real dentro del Aula Virtual.

## 📩 Contacto

**Lautaro Jofre**
* 🎓 Estudiante de Ingeniería en Sistemas de Información (UTN)
* 💼 LinkedIn: www.linkedin.com/in/lautaro-jofre
* 🌐 Portfolio: [portfolio-web-jofre-lautaro.vercel.app](https://portfolio-web-jofre-lautaro.vercel.app/)
