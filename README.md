![CI Status](https://github.com/Mxlaser/projet-web/actions/workflows/ci.yml/badge.svg)

## 📖 Description

**Personal Resource Manager** est une application web conçue pour centraliser, organiser et retrouver facilement une grande variété de ressources personnelles et professionnelles.

Dans un contexte où l'information est dispersée (signets, fichiers locaux, contacts, post-its), cette application agit comme un "second cerveau" numérique. Elle permet de stocker des documents, des liens, des contacts, des événements et des notes au sein d'une interface unique, dotée d'un système de catégorisation flexible (types, catégories, tags) et d'un moteur de recherche performant.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités Implémentées

#### Authentification & Sécurité
* **Inscription** : Création de compte avec email et mot de passe
* **Connexion** : Authentification sécurisée avec JWT
* **Déconnexion** : Bouton de déconnexion disponible sur toutes les pages
* **Protection des routes** : Redirection automatique vers la page de login pour les pages protégées
* **Gestion de session** : Token stocké dans le localStorage
* **Intercepteur API** : Gestion automatique des erreurs 401/403 avec redirection

#### Gestion des Ressources (CRUD complet)
* **Types de ressources supportés** :
  * **Note** : Prise de notes textuelles avec description
  * **Lien** : Sauvegarde d'URL avec description optionnelle
  * **Fichier** : Upload et gestion de fichiers (PDF, Images, etc.)
* **Opérations** :
  * Création de ressources avec date personnalisée
  * Modification de ressources existantes
  * Suppression de ressources
  * Consultation détaillée des ressources
  * Marquer/démarquer comme favori

#### Système de Catégorisation
* **Catégories** : Création et gestion de catégories personnalisables
* **Tags** : Système de tags avec relation many-to-many
* **Organisation** : Association de ressources à des catégories et tags

#### Recherche & Filtrage Avancés
* **Recherche textuelle** : Recherche dans le titre, description, URL, nom de fichier, catégorie et tags
* **Filtres par catégorie** : Filtrage des ressources par catégorie
* **Filtres par tag** : Filtrage des ressources par tag
* **Filtre par date** : Filtrage par intervalle de dates de création
* **Combinaison de filtres** : Possibilité de combiner plusieurs filtres simultanément
* **Réinitialisation** : Bouton pour réinitialiser tous les filtres

#### Vue Calendrier
* **Vue mensuelle** : Affichage des ressources organisées par jour dans un calendrier mensuel
* **Navigation** : Navigation entre les mois (précédent/suivant)
* **Bouton "Aujourd'hui"** : Retour rapide au mois actuel
* **Création depuis le calendrier** : Clic sur une date pour créer une ressource avec date personnalisée
* **Affichage des ressources** : Visualisation des ressources par jour avec badges colorés
* **Détails de ressource** : Clic sur une ressource pour voir les détails avec possibilité de modifier/supprimer
* **Dates passées** : Dates passées grisées et non cliquables pour création

#### Interface Utilisateur
* **Design moderne** : Interface élégante avec Tailwind CSS
* **Mode sombre** : Toggle pour basculer entre mode clair et sombre
* **Responsive** : Interface adaptée mobile et desktop
* **Animations** : Transitions fluides et animations subtiles
* **UX optimisée** : Navigation intuitive et feedback visuel

#### Gestion des Fichiers
* **Upload de fichiers** : Support de l'upload de fichiers via Multer
* **Prévisualisation d'images** : Affichage des images directement dans l'interface
* **Téléchargement** : Accès aux fichiers uploadés
* **Gestion des erreurs** : Gestion des erreurs de chargement d'images

### 🚀 Fonctionnalités Avancées (Roadmap)
* [ ] **Collections** : Regroupement thématique de ressources
* [ ] **Partage** : Génération de liens publics pour partager des ressources
* [ ] **Rappels** : Notifications par email avant les échéances d'événements
* [ ] **Export/Import** : Export des ressources en JSON/CSV
* [ ] **Recherche avancée** : Recherche par opérateurs booléens

## 🛠 Stack Technique

Ce projet repose sur une architecture **PERN** (PostgreSQL, Express, React, Node.js) conteneurisée avec Docker.

### Backend (API)
* **Runtime** : Node.js
* **Framework** : Express.js 5.2.1
* **Base de données** : PostgreSQL 15 (Alpine)
* **ORM** : Prisma 5.22.0
* **Authentification** : JWT (jsonwebtoken)
* **Upload de fichiers** : Multer 2.0.2
* **Documentation API** : Swagger (swagger-jsdoc, swagger-ui-express)
* **Sécurité** : bcryptjs pour le hachage des mots de passe
* **CORS** : Configuration CORS pour les requêtes cross-origin

### Frontend (Client)
* **Framework** : React 19.2.0
* **Build Tool** : Vite 7.2.4
* **Routing** : React Router DOM 7.12.0
* **Styling** : Tailwind CSS 3.4.17
* **HTTP Client** : Axios 1.13.2
* **State Management** : Context API (AuthContext, ThemeContext)
* **Autres bibliothèques** :
  * react-color 2.19.3 (sélecteur de couleur)
* **Outils de développement** :
  * ESLint 9.39.1
  * PostCSS 8.5.6
  * Autoprefixer 10.4.23

### DevOps & Outils
* **Conteneurisation** : Docker & Docker Compose
* **CI/CD** : GitHub Actions (Linting, Tests, Build)
* **Versionning** : Git & GitHub
* **Base de données** : PostgreSQL avec volumes Docker persistants

## 📂 Structure du Projet

L'architecture suit une séparation claire entre le client et le serveur :

```
├── backend/                    # API Backend (Node/Express)
│   ├── controllers/            # Logique métier
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   └── resourceController.js
│   ├── middleware/             # Middlewares
│   │   ├── auth.js             # Authentification JWT
│   │   └── upload.js           # Gestion upload Multer
│   ├── routes/                 # Définition des endpoints API
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── resourceRoutes.js
│   ├── prisma/                 # Configuration Prisma
│   │   ├── schema.prisma       # Schéma de base de données
│   │   └── migrations/         # Migrations de base de données
│   ├── uploads/                # Stockage des fichiers (hors git)
│   ├── tests/                  # Tests unitaires
│   ├── server.js               # Point d'entrée du serveur
│   ├── swaggerConfig.js        # Configuration Swagger
│   └── dockerfile              # Dockerfile pour le backend
│
├── frontend/                   # Application Frontend (React)
│   ├── public/                 # Fichiers statiques
│   ├── src/
│   │   ├── api/                # Services API (Axios)
│   │   │   ├── authService.js
│   │   │   ├── categoryService.js
│   │   │   ├── resourceService.js
│   │   │   └── axios.js        # Configuration Axios
│   │   ├── context/            # Contextes React
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/              # Pages principales
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ResourceListPage.jsx
│   │   │   ├── ResourceFormPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── router/             # Configuration du routing
│   │   │   ├── AppRouter.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layout/             # Layouts
│   │   │   └── AppLayout.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx            # Point d'entrée React
│   │   └── index.css            # Styles globaux
│   ├── Dockerfile              # Dockerfile pour le frontend
│   ├── vite.config.js          # Configuration Vite
│   └── tailwind.config.js      # Configuration Tailwind
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Configuration CI/CD
│
├── docker-compose.yml          # Orchestration des services
└── README.md                   # Ce fichier
```

## 🚀 Installation & Démarrage

### Prérequis
* Docker et Docker Compose installés
* Node.js (géré par NVM) pour le développement local
* Git

### Installation avec Docker (Recommandé)

1. **Cloner le repository**
```bash
git clone <repository-url>
cd <nomDuProjet>
```

2. **Démarrer les services**
```bash
docker-compose up -d
```

Cette commande démarre :
* PostgreSQL sur le port 5432
* Backend API sur le port 3000
* Frontend sur le port 5173

3. **Accéder à l'application**
* Frontend : http://localhost:5173
* Backend API : http://localhost:3000
* Documentation API (Swagger) : http://localhost:3000/api-docs

### Installation en développement local

#### Backend

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer la base de données**
```bash
# Créer un fichier .env avec :
DATABASE_URL="postgres://user:password@localhost:5432/resource_db"
PORT=3000
JWT_SECRET="votre_secret_jwt"
```

3. **Initialiser Prisma**
```bash
npx prisma generate
npx prisma db push
```

4. **Démarrer le serveur**
```bash
npm run dev
```

#### Frontend

1. **Installer les dépendances**
```bash
cd frontend
npm install
```

2. **Configurer les variables d'environnement**
```bash
# Créer un fichier .env avec :
VITE_API_URL=http://localhost:3000
```

3. **Démarrer le serveur de développement**
```bash
npm run dev
```

## 📡 API Endpoints

### Authentification (`/api/auth`)

* `POST /api/auth/register` - Inscription d'un nouvel utilisateur
* `POST /api/auth/login` - Connexion et récupération du token JWT
* `GET /api/auth/me` - Récupération des informations de l'utilisateur connecté

### Ressources (`/api/resources`)

* `GET /api/resources` - Liste toutes les ressources de l'utilisateur
* `POST /api/resources` - Créer une nouvelle ressource (avec upload de fichier optionnel)
* `GET /api/resources/:id` - Récupérer une ressource par son ID
* `PUT /api/resources/:id` - Modifier une ressource existante
* `DELETE /api/resources/:id` - Supprimer une ressource

### Catégories (`/api/categories`)

* `GET /api/categories` - Liste toutes les catégories
* `POST /api/categories` - Créer une nouvelle catégorie

**Note** : Toutes les routes (sauf `/api/auth/register` et `/api/auth/login`) nécessitent un token JWT dans le header `Authorization: Bearer <token>`

## 🎨 Pages Frontend

* `/login` - Page de connexion
* `/signup` - Page d'inscription
* `/resources` - Liste des ressources avec filtres et recherche
* `/resources/new` - Création d'une nouvelle ressource
* `/resources/:id/edit` - Modification d'une ressource
* `/calendar` - Vue calendrier mensuelle des ressources
* `/dashboard` - Tableau de bord (page disponible)

## 🗄️ Modèle de Données

### User
* `id` (Int, Primary Key)
* `email` (String, Unique)
* `password` (String, Hashed)
* `createdAt` (DateTime)

### Resource
* `id` (Int, Primary Key)
* `title` (String)
* `type` (String) - note, link, file
* `content` (JSON) - Contenu flexible selon le type
* `isFavorite` (Boolean)
* `createdAt` (DateTime) - Peut être personnalisé
* `updatedAt` (DateTime)
* `userId` (Int, Foreign Key → User)
* `categoryId` (Int, Foreign Key → Category, Optional)

### Category
* `id` (Int, Primary Key)
* `name` (String, Unique)

### Tag
* `id` (Int, Primary Key)
* `name` (String, Unique)

### Relations
* User → Resources (One-to-Many)
* Category → Resources (One-to-Many)
* Resource ↔ Tags (Many-to-Many)

## 🔒 Sécurité

* **Authentification JWT** : Tokens sécurisés pour l'authentification
* **Hachage des mots de passe** : Utilisation de bcryptjs
* **Protection des routes** : Middleware d'authentification sur toutes les routes protégées
* **Validation des données** : Validation côté serveur
* **CORS** : Configuration CORS pour la sécurité cross-origin
* **Intercepteur API** : Gestion automatique des erreurs d'authentification

## 🧪 Tests

Les tests sont configurés avec Jest. Pour exécuter les tests :

```bash
cd backend
npm test
```

## 📝 Scripts Disponibles

### Backend
* `npm run dev` - Démarre le serveur en mode développement avec Prisma
* `npm start` - Démarre le serveur en mode production
* `npm test` - Exécute les tests
* `npm run lint` - Vérifie le code avec ESLint
* `npm run db:sync` - Synchronise la base de données avec Prisma

### Frontend
* `npm run dev` - Démarre le serveur de développement Vite
* `npm run build` - Build de production
* `npm run preview` - Prévisualise le build de production
* `npm run lint` - Vérifie le code avec ESLint

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est un projet académique.

## 👥 Auteurs

Projet développé dans le cadre du cours de Projet Web 2.

---

**Note** : Ce README est mis à jour régulièrement pour refléter l'état actuel du projet.
