# Usamos una imagen de Java 17 súper liviana
FROM eclipse-temurin:25-jdk-alpine

# Creamos una carpeta adentro del contenedor
WORKDIR /app

# Copiamos el .jar que compilamos con Maven y lo renombramos a app.jar
COPY target/reservation-backend-0.0.1-SNAPSHOT.jar app.jar

# Le avisamos a Docker que este contenedor se comunica por el puerto 8087
EXPOSE 8087

# El comando que enciende la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]