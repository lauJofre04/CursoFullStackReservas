# 🎓 DevCursos - Plataforma LMS Full Stack

![Estado](https://img.shields.io/badge/Estado-En_Desarrollo-green)
![Java](https://img.shields.io/badge/Java-Spring_Boot-blue)
![React](https://img.shields.io/badge/React-Vite-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

DevCursos es un **Sistema de Gestión de Aprendizaje (LMS)** desarrollado completamente desde cero. Permite a los administradores crear y gestionar cursos, lecciones y evaluaciones, mientras que ofrece a los estudiantes un "Aula Virtual" intuitiva para consumir contenido multimedia y rendir exámenes con calificación automática.

Este proyecto fue creado como práctica integradora de arquitectura de software, separando la lógica de negocio en una API RESTful y consumiéndola desde una Single Page Application (SPA).

## 🚀 Características Principales

### 👨‍🏫 Panel de Administrador
* **Gestión de Cursos (CRUD):** Creación y edición de cursos con imágenes, títulos y descripciones.
* **Constructor de Módulos y Lecciones:** Organización de contenido en árbol (Módulos -> Lecciones -> Recursos).
* **Gestión de Recursos Multimedia:** Soporte para adjuntar videos (YouTube/Drive), enlaces externos, y documentos PDF a cada lección.
* **Motor de Evaluaciones:** Creación de exámenes dinámicos tipo *Multiple Choice* con múltiples preguntas y opciones.

### 👨‍🎓 Experiencia del Estudiante (Aula Virtual)
* **Exploración de Cursos:** Vidriera pública con los cursos disponibles.
* **Navegación Fluida:** Barra lateral dinámica para alternar entre módulos y lecciones sin recargar la página.
* **Rendición de Exámenes:** Interfaz limpia para responder cuestionarios con validación en tiempo real y calificación automática provista por el backend.

## 🛠️ Tecnologías Utilizadas

**Frontend:**
* React (Vite)
* Tailwind CSS (para el diseño UI/UX responsivo)
* React Router DOM
* Axios (para peticiones HTTP)

**Backend:**
* Java 17+
* Spring Boot 3
* Spring Security & JWT (Autenticación y control de roles)
* Spring Data JPA / Hibernate
* Patrón DTO para transferencia de datos y prevención de recursión circular.

## ⚙️ Instalación y Configuración Local

Si deseas correr este proyecto en tu entorno local, sigue estos pasos:

### 1. Clonar el repositorio
`git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git`

### 2. Levantar el Backend (Spring Boot)
1. Navega a la carpeta del backend.
2. Configura las credenciales de tu base de datos (MySQL/PostgreSQL) en el archivo `src/main/resources/application.properties`.
3. Ejecuta el proyecto desde tu IDE favorito (IntelliJ, Eclipse, VS Code) o usa Maven:
`mvn spring-boot:run`

### 3. Levantar el Frontend (React)
1. Abre una nueva terminal y navega a la carpeta del frontend.
2. Instala las dependencias:
`npm install`
3. Inicia el servidor de desarrollo:
`npm run dev`
4. Abre tu navegador en `http://localhost:5173`.

## 🗺️ Roadmap (Próximos Pasos)
- [ ] Implementación de Calendario de Tareas (`react-big-calendar`).
- [ ] Integración de pasarela de pagos (Mercado Pago).
- [ ] Dockerización completa (Frontend, Backend y Base de Datos).

## 📩 Contacto

**Lautaro Jofre**
* 💼 LinkedIn: [Perfil de LinkedIn](https://www.linkedin.com/in/tu-usuario/)
* 🌐 Portfolio: [portfolio-web-jofre-lautaro.vercel.app](https://portfolio-web-jofre-lautaro.vercel.app/)