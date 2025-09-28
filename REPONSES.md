# Projet : réducteur d’URL en Node.js/Express


## Partie 1 : prise en main

### Donner la commande httpie correspondant à la commande curl donnée par la doc pour la route POST.

```http POST http://localhost:8080/api-v1/ url="https://perdu.com"```

### Démarrer l’application en mode production avec npm run prod puis en mode développement avec npm run dev. Donner les principales différences entre les deux modes.

Le mode développement (npm run dev) utilise nodemon pour exécuter src/server.js. Le serveur redémarre automatiquement à chaque modification des fichiers (.js, .mjs, .cjs, .json), ce qui le rend idéal pour tester rapidement les changements. Cependant, il consomme plus de ressources en raison de la surveillance.

En revanche, le mode production (npm run prod) exécute directement node src/server.js sans surveillance. Il n'y a pas de redémarrage automatique ; un arrêt/relance manuel est nécessaire. Ce mode est optimisé pour la stabilité et la performance en production.

### Donner le script npm qui permet de formatter automatiquement tous les fichiers .mjs

```"format": "prettier --write \"**/*.mjs\""```

### Les réponses HTTP contiennent une en-tête X-Powered-By. Donner la configuration Express à modifier pour qu’elle n’apparaisse plus.

```app.disable('x-powered-by');```

### Créer un nouveau middleware (niveau application) qui ajoute un header X-API-version avec la version de l’application. Donner le code.


```
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  next();
});
```

### Trouver un middleware Express qui permet de répondre aux requêtes favicon.ico avec static/logo_univ_16.png. Donner le code.

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/logo_univ_16.png')); 
});

### Donner les liens vers la documentation du driver SQLite utilisé dans l’application.

https://github.com/TryGhost/node-sqlite3

https://www.npmjs.com/package/sqlite3

### Indiquer à quels moments la connexion à la base de données est ouverte et quand elle est fermée.

L'application ouvre la connexion au démarrage en instanciant la classe Database dans src/utils/database.js. La connexion se ferme automatiquement lorsque l'application s'arrête. En mode production, on exécute directement node src/server.js sans surveillance, ce qui nécessite un arrêt/relance manuel et  optimise  la stabilité et la performance.

### Avec un navigateur en mode privé visiter une première fois http://localhost:8080/, puis une deuxième. Ensuite rechargez avec Ctrl+Shift+R. Conclure sur la gestion du cache par Express.

Première visite (mode privé, http://localhost:8080/) : Le serveur renvoie la réponse JSON (ex. : {"count": 0}).
Deuxième visite : En mode privé, le cache est généralement désactivé ou limité à la session, donc le serveur est recontacté, renvoyant la même réponse.
Rechargement avec Ctrl+Shift+R : Force le navigateur à ignorer tout cache et refait une requête au serveur, renvoyant la même réponse.
Conclusion : Express ne configure pas de gestion de cache par défaut (pas d'en-têtes Cache-Control, ETag, ou Last-Modified dans le code). Le comportement du cache dépend du navigateur, mais en mode privé, les requêtes atteignent généralement le serveur, et Ctrl+Shift+R garantit une nouvelle requête.

### Ouvrir deux instances de l’application, une sur le port 8080 avec npm run dev et une autre sur le port 8081 avec la commande cross-env PORT=8081 NODE_ENV=development npx nodemon server.mjs. Créer un lien sur la première instance http://localhost:8080/ et ensuite un autre sur la seconde instante http://localhost:8081/. Les liens de l’un doivent être visibles avec l’autre. Expliquer pourquoi.