# TP6 - Réducteur d’URL en Node.js/Express

**Démo en ligne : [https://tp6-devweb-maviet-cedric.onrender.com](https://tp6-devweb-maviet-cedric.onrender.com)**

## Présentation
Ce projet est un service de réduction d’URL, similaire à bit.ly ou tinyurl.com. Il permet de transformer une URL longue en une URL courte, qui redirige vers l’URL d’origine. Le projet inclut une API REST, un client HTML et une interface AJAX.


## Installation
1. Cloner le dépôt :
   ```sh
   git clone https://github.com/otomutachi/TP6-devweb-Maviet-Cedric.git
   cd TP6-devweb-Maviet-Cedric
   ```
2. Installer les dépendances :
   ```sh
   npm install
   ```
3. Configurer l’environnement :
   Créer un fichier `.env` à la racine :
   ```
   PORT=8080
   LINK_LEN=6
   DB_FILE=database/database.sqlite
   DB_SCHEMA=database/database.sql
   ```
4. Lancer l’application :
   - Développement : `npm run dev`
   - Production : `npm run prod`


## API
### Routes principales
- `GET /api-v2/` : Nombre de liens (JSON) ou page d’accueil (HTML)
- `POST /api-v2/` : Création d’un lien court (JSON/HTML)
- `GET /api-v2/:url` : Infos sur le lien (JSON) ou redirection (HTML)
- `DELETE /api-v2/:url` : Suppression sécurisée (clé secrète dans X-API-Key)

## Structure du projet
```
TP6-devweb-Maviet-Cedric
├── src
│   ├── app.js           # Configuration Express
│   ├── server.js        # Lancement du serveur principal
│   ├── routes
│   │   ├── api-v1.js    # API v1
│   │   └── api-v2.js    # API v2 (négociation de contenu, suppression)
│   └── utils
│       ├── config.js    # Configuration centralisée
│       ├── database.js  # Accès base SQLite
│       └── url.js       # Génération des liens et secrets
├── static
│   ├── index.html       # Client AJAX
│   ├── app.js           # JS du client AJAX
│   ├── logo_univ_16.png # Favicon
│   ├── open-api.yaml    # Spécification OpenAPI
│   └── style.css        # Feuille de style CSS
├── views
│   └── root.ejs         # Template EJS pour rendu HTML
├── database
│   ├── database.sql     # Schéma de la base
│   └── database.sqlite  # Base SQLite
```

## Documentation
- Swagger UI : [https://tp6-devweb-maviet-cedric.onrender.com/api-docs](https://tp6-devweb-maviet-cedric.onrender.com/api-docs)
- Spécification OpenAPI : `static/open-api.yaml`


## Auteur
Cedric Maviet