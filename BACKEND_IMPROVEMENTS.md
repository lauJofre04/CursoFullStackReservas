# 🚀 Guía de Prueba - Backend Improvements

## Ticket 2: Global Exception Handler ✅

### Archivos Creados/Modificados

**1. ErrorResponse.java (DTO)**
- Ubicación: `exception/ErrorResponse.java`
- Campos: `mensaje`, `status`, `tipo`, `fecha`, `path`
- Formato de fecha: ISO 8601 (yyyy-MM-dd'T'HH:mm:ss)

**2. GlobalExceptionHandler.java (Mejorado)**
- Ubicación: `exception/GlobalExceptionHandler.java`
- Maneja:
  - ✅ `BusinessRuleViolationException` → HTTP 400/409 (según contexto)
  - ✅ `MethodArgumentNotValidException` → HTTP 400 (validaciones)
  - ✅ `RuntimeException` → HTTP 500
  - ✅ `Exception` genérica → HTTP 500

### Cómo Probar en Postman

#### Test 1: Error de Regla de Negocio
```bash
GET http://localhost:8087/api/cursos/999
```
**Respuesta esperada (200 si existe, 404 si fuerza error):**
```json
{
  "mensaje": "Curso no encontrado o ha sido eliminado",
  "status": 404,
  "tipo": "BUSINESS_RULE_VIOLATION",
  "fecha": "2026-03-31T14:30:00",
  "path": "/api/cursos/999"
}
```

#### Test 2: Error de Validación
```bash
POST http://localhost:8087/api/cursos
Content-Type: application/json

{
  "titulo": "",
  "descripcion": "desc",
  "precio": -100
}
```
**Respuesta esperada:**
```json
{
  "mensaje": "titulo: no debe estar vacío; precio: debe ser mayor que 0",
  "status": 400,
  "tipo": "VALIDATION_ERROR",
  "fecha": "2026-03-31T14:30:00",
  "path": "/api/cursos"
}
```

---

## Ticket 3: Swagger UI ✅

### Archivos Creados/Modificados

**1. SwaggerConfig.java (Nueva)**
- Ubicación: `config/SwaggerConfig.java`
- Configura:
  - ✅ Información de la API
  - ✅ Esquema JWT Bearer Auth
  - ✅ Descripción para endpoints protegidos

**2. application.properties (Actualizado)**
```properties
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true
springdoc.api-docs.path=/v3/api-docs
springdoc.show-actuator=false
```

### Cómo Acceder

1. **Levantar el backend:** `mvn spring-boot:run`
2. **Abrir en navegador:**
   ```
   http://localhost:8087/swagger-ui/index.html
   ```

### Test de Endpoints en Swagger

#### Sin Autenticación (Públicos)
- GET `/api/cursos` ✅
- GET `/api/cursos/{id}` ✅
- POST `/api/auth/register` ✅
- POST `/api/auth/login` ✅

#### Con Autenticación (Protegidos)
1. **Login primero:**
   - POST `/api/auth/login`
   - Body: `{ "email": "admin@example.com", "password": "password" }`
   - Copiar el `token` de la respuesta

2. **Configurar JWT en Swagger:**
   - Click en botón "Authorize" (esquina superior derecha)
   - Pegar el token (SIN el prefijo "Bearer", Swagger lo agrega automáticamente)
   - Click en "Authorize"

3. **Probar endpoints protegidos:**
   - POST `/api/cursos` (crear curso)
   - PUT `/api/cursos/{id}` (editar curso)
   - DELETE `/api/cursos/{id}` (eliminar curso)

---

## ✅ Checklist de Validación

### Ticket 2
- [x] DTO ErrorResponse creado con todos los campos
- [x] GlobalExceptionHandler maneja BusinessRuleViolationException
- [x] GlobalExceptionHandler maneja MethodArgumentNotValidException
- [x] GlobalExceptionHandler maneja RuntimeException
- [x] Respuestas en formato JSON limpio
- [x] Status HTTP correcto en cada caso
- [x] Fecha y path incluidos en respuesta

### Ticket 3
- [x] Dependencia springdoc-openapi-starter-webmvc-ui en pom.xml
- [x] SwaggerConfig.java creado
- [x] JWT Bearer Auth configurado
- [x] Accesible en http://localhost:8087/swagger-ui/index.html
- [x] Botón "Authorize" funcional
- [x] Endpoints protegidos testeables con token

---

## 🔧 Comandos Útiles

```bash
# Compilar
mvn clean compile

# Ejecutar tests
mvn test

# Levantar el proyecto
mvn spring-boot:run

# Ver log de errores
mvn spring-boot:run 2>&1 | grep -i error
```

---

## 📝 Notas Importantes

1. **Swagger se genera automáticamente** - No necesita mantenimiento
2. **El token JWT debe configurarse ANTES de probar endpoints protegidos**
3. **Los errores ahora devuelven JSON válido en lugar de HTML**
4. **La información sensible está oculta en el stacktrace**
