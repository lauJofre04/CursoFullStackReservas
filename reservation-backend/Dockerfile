# ==========================================
# ETAPA 1: Construcción (Build)
# ==========================================
FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /app

# Instalamos Maven temporalmente en el contenedor
RUN apk add --no-cache maven

# Copiamos el archivo de configuración y el código fuente desde GitHub
COPY pom.xml .
COPY src ./src

# Compilamos el proyecto exactamente igual que en tu PC
RUN mvn clean package -DskipTests

# ==========================================
# ETAPA 2: Ejecución (Run)
# ==========================================
FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

# Robamos el archivo .jar que se acaba de crear en la "ETAPA 1" y lo pasamos acá
COPY --from=build /app/target/reservation-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8087

# Arrancamos el servidor
ENTRYPOINT ["java", "-jar", "app.jar"]