# Application de Gestion de Projets et Budgets

Application full-stack permettant de gérer des projets avec suivi budgétaire et gestion des dépenses.

## Technologies

### Backend (API)
- Node.js / Express
- MongoDB / Mongoose
- Passport JWT (authentification)
- Brevo (envoi d'emails)
- Sentry (monitoring)

### Frontend (App)
- React
- React Router
- Tailwind CSS
- Vite

## Fonctionnalités principales

### Gestion des projets
- Création de projets avec nom, description, budget total et seuil d'alerte
- Visualisation de tous les projets de l'utilisateur
- Affichage des statistiques budgétaires (total, dépensé, restant)
- Suppression de projets
- Seuil d'alerte personnalisable (threshold)

### Gestion des dépenses
- Ajout de dépenses liées à un projet (titre, description, montant, date)
- Visualisation de toutes les dépenses d'un projet
- Suppression de dépenses
- Mise à jour automatique du budget après chaque opération
- Validation : impossibilité de créer une dépense si le budget est insuffisant

### Système d'alertes
- Détection automatique des seuils budgétaires
- Statut "warning" : budget restant inférieur au seuil (par défaut 80%)
- Statut "out_of_budget" : budget épuisé
- Notifications visuelles dans l'interface
- Envoi automatique d'emails lors du changement de statut

## Structure du projet

```
.
├── api/                    # Backend Node.js
│   └── src/
│       ├── controllers/    # Routes et logique métier
│       ├── models/         # Modèles Mongoose
│       ├── services/       # Services (Brevo, MongoDB, Passport, Sentry)
│       └── utils/          # Utilitaires et constantes
│
└── app/                    # Frontend React
    └── src/
        ├── components/     # Composants réutilisables
        ├── scenes/         # Pages de l'application
        ├── services/       # API client et store
        └── utils/          # Utilitaires
```

## Installation

### Backend
```bash
cd api
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npm run dev
```

### Frontend
```bash
cd app
npm install
npm run dev
```


## Routes API principales

### Projets
- `POST /project` - Créer un projet
- `GET /project` - Lister tous les projets de l'utilisateur
- `GET /project/:id` - Récupérer un projet spécifique
- `DELETE /project/:id` - Supprimer un projet

### Dépenses
- `POST /project/:projectId/expenses` - Créer une dépense
- `GET /project/:projectId/expenses` - Lister les dépenses d'un projet
- `GET /project/:projectId/expenses/:expenseId` - Récupérer une dépense
- `DELETE /project/:projectId/expenses/:expenseId` - Supprimer une dépense

[lien site deploye](https://d3klciaq2e93fx.cloudfront.net/index.html)




---
