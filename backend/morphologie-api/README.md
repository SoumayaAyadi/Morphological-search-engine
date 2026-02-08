# Morphologie API

API REST pour le moteur morphologique.

## Démarrage

```bash
mvn spring-boot:run
```

## Documentation

Swagger UI disponible à: http://localhost:8080/swagger-ui.html

## Endpoints

- POST `/api/v1/morphologie/generate` - Générer un mot
- POST `/api/v1/morphologie/analyze` - Analyser un mot
- GET `/api/v1/morphologie/racines` - Liste des racines
- GET `/api/v1/morphologie/schemes` - Liste des schèmes
