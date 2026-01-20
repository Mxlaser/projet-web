![CI Status](https://github.com/TON_PSEUDO/TON_REPO/actions/workflows/ci.yml/badge.svg)
## 📖 Description

**Personal Resource Manager** est une application web conçue pour centraliser, organiser et retrouver facilement une grande variété de ressources personnelles et professionnelles.

Dans un contexte où l'information est dispersée (signets, fichiers locaux, contacts, post-its), cette application agit comme un "second cerveau" numérique. Elle permet de stocker des documents, des liens, des contacts, des événements et des notes au sein d'une interface unique, dotée d'un système de catégorisation flexible (types, catégories, tags) et d'un moteur de recherche performant.

## ✨ Fonctionnalités

### 🎯 MVP (Minimum Viable Product)
Ces fonctionnalités constituent le cœur de l'application :

* **Authentification & Utilisateurs** : Inscription, connexion sécurisée et gestion de profil.
* **Gestion des Ressources (CRUD)** :
    * **Liens** : Sauvegarde d'URL.
    * **Documents** : Gestion de fichiers (PDF, Images).
    * **Contacts** : Carnet d'adresses professionnel.
    * **Événements** : Agenda avec dates.
    * **Notes** : Prise de notes textuelles.
* **Système de Catégorisation** :
    * Catégories personnalisables (ex: Travail, Personnel).
    * Système de **Tags** (étiquettes) avec autocomplétion pour une classification transversale.
* **Recherche & Filtrage** :
    * Recherche par mots-clés (titre/description).
    * Filtres avancés par type, catégorie, tags et date.
* **Interface** : Dashboard responsive (Mobile/Desktop) pour une vue d'ensemble rapide.

### 🚀 Fonctionnalités Avancées (Roadmap)
* [ ] **Upload de fichiers** : Stockage local ou cloud avec validation de type/taille.
* [ ] **Favoris** : Accès rapide aux ressources prioritaires.
* [ ] **Collections** : Regroupement thématique de ressources.
* [ ] **Calendrier** : Vue mensuelle des événements.
* [ ] **Partage** : Génération de liens publics pour partager des ressources.
* [ ] **Rappels** : Notifications par email avant les échéances d'événements.

## 🛠 Stack Technique

Ce projet repose sur une architecture **PERN** (PostgreSQL, Express, React, Node.js) conteneurisée.

### Backend (API)
* **Runtime** : Node.js
* **Framework** : Express.js
* **Base de données** : PostgreSQL (Relationnelle, optimisée pour les relations many-to-many des tags).
* **ORM** : Sequelize (ou Prisma).
* **Upload** : Multer.

### Frontend (Client)
* **Framework** : React.js.
* **Routing** : React Router.
* **UI Library** : Material-UI (MUI) ou Tailwind CSS.
* **State Management** : Context API / React Hooks.

### DevOps & Outils
* **Conteneurisation** : Docker & Docker Compose.
* **CI/CD** : GitHub Actions (Linting, Tests, Build).
* **Versionning** : Git & GitHub.

## 📂 Structure du Projet

L'architecture suit une séparation claire entre le client et le serveur :

```bash
/
├── client/                 # Application Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages principales (Dashboard, Login...)
│   │   └── services/       # Appels API (Axios/Fetch)
│   └── Dockerfile
│
├── server/                 # API Backend (Node/Express)
│   ├── src/
│   │   ├── config/         # Configuration DB & Env
│   │   ├── controllers/    # Logique métier
│   │   ├── models/         # Modèles Sequelize/Prisma
│   │   ├── routes/         # Définition des endpoints API
│   │   └── middlewares/    # Auth, Validation, Upload
│   ├── uploads/            # Stockage des fichiers (hors git)
│   └── Dockerfile
│
├── docker-compose.yml      # Orchestration des services (App, DB, Adminer)
└── README.md