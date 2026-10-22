# Etapa 1: Compilación con Maven y OpenJDK 17
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Descargar dependencias para aprovechar caché de capas Docker
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copiar código fuente y compilar JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Etapa 2: Imagen mínima de ejecución con JRE 17
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Crear carpetas requeridas para almacenamiento de uploads
RUN mkdir -p uploads/materiales uploads/documentos uploads/avances

# Copiar el binario generado
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
