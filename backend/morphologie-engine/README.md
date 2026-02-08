# Morphologie Engine

Bibliothèque Java pour l'analyse morphologique de la langue arabe.

## Compilation

```bash
mvn clean install
```

## Utilisation

```java
Morphologie engine = new Morphologie();
engine.arbre.addRacine("كتب");
engine.generer("كتب", "فاعل");
```
