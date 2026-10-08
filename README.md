
# Pokémon Manager

Application web développée avec Angular permettant d'explorer les Pokémon grâce à l'API publique PokéAPI.

## Présentation

Pokémon Manager est un Pokédex interactif qui permet de consulter les Pokémon, de rechercher un Pokémon précis et de filtrer les résultats par type ou par génération.

L'application propose une interface responsive et une fenêtre de détails pour consulter les caractéristiques de chaque Pokémon.

## Fonctionnalités

- Affichage des Pokémon sous forme de cartes
- Pagination des résultats
- Recherche d'un Pokémon par nom ou par numéro
- Filtrage des Pokémon par type
- Filtrage des Pokémon par génération
- Affichage des détails d'un Pokémon dans une fenêtre modale
- Consultation des statistiques de base
- Traduction en français des types et des statistiques
- Gestion des erreurs et des états de chargement
- Interface responsive

## Technologies utilisées

- Angular
- TypeScript
- HTML
- CSS
- RxJS
- PokéAPI
- Karma et Jasmine pour les tests unitaires

## Installation

Cloner le dépôt :

```bash
git clone URL_DU_DEPOT
```

Accéder au dossier :

```bash
cd PokemonManager
```

Installer les dépendances :

```bash
npm install
```

Démarrer le serveur de développement :

```bash
npm start
```

Ouvrir l'application dans le navigateur à l'adresse :

http://localhost:4200

## Tests

Pour lancer les tests unitaires :

```bash
npm test -- --watch=false
```

## Build de production

Pour générer une version de production :

```bash
npm run build
```

## API utilisée

Les données des Pokémon proviennent de l'API publique PokéAPI :

https://pokeapi.co/

## Contexte du projet

Projet personnel réalisé dans le cadre de la préparation au titre professionnel Concepteur Développeur d'Applications (CDA).

## Auteur

Projet développé dans le cadre d'un portfolio de développement web.
