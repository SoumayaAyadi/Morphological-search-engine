# Morphologie App

Application complète pour l'analyse morphologique de la langue arabe.

## Structure du Projet

- `backend/morphologie-engine` - Moteur morphologique (bibliothèque)
- `backend/morphologie-api` - API REST Spring Boot
- `cli` - Interface en ligne de commande
- `frontend` - Application mobile React Native
- `docs` - Documentation

## Démarrage Rapide

### Backend

```bash
# Compiler et installer le moteur
cd backend/morphologie-engine
mvn clean install

# Lancer l'API
cd ../morphologie-api
mvn spring-boot:run
```

### CLI

```bash
cd cli
mvn clean package
java -jar target/morphologie-cli-1.0-jar-with-dependencies.jar
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Documentation

Voir le dossier `docs/` pour plus d'informations.
