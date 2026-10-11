# WEARO Studio

Boutique React responsive pour le Togo, avec catalogue filtrable, variantes et stocks, panier, promotions, commande Mobile Money en mode démonstration, espace client local, API Node et tableau de bord administrateur.

## Prérequis

- Node.js 20 ou plus récent
- npm

## Installation et développement

```sh
npm install
```

Dans un premier terminal, démarrer l’API et le stockage JSON local :

```sh
npm run api
```

Dans un second terminal, démarrer React/Vite :

```sh
npm run dev
```

Ouvrir l’adresse locale affichée par Vite (par défaut `http://127.0.0.1:5173`). Les premières requêtes créent `server/data/products.json`, `promotions.json`, `orders.json` et `messages.json` avec des données de démonstration. Les commandes et changements de stock sont persistés localement.

En développement uniquement, la clé d’administration est `wearo-demo-admin-key`. Le raccourci « Admin » ouvre le tableau de bord. Les clients peuvent passer une commande de démonstration via Flooz, Mixx by Yas ou paiement à la livraison. Le site ne déclenche aucun débit, ne demande aucun code secret et conserve l’état du paiement Mobile Money comme « en attente ».

## Vérifications

```sh
npm test
npm run build
```

Les tests vérifient la création de commandes, la diminution du stock par variante, les remises, la livraison offerte et les validations de paiement/stock.

## Déploiement

`npm run build` produit le site React dans `dist/`. `npm start` sert ce site ainsi que l’API depuis un seul processus Node. La plateforme d’hébergement doit prendre en charge Node.js, garder le dossier `server/data` sur un volume persistant et définir :

- `HOST=0.0.0.0` si l’hébergeur exige une écoute publique
- `PORT` fourni par l’hébergeur
- `NODE_ENV=production`
- `ADMIN_API_KEY` : une valeur longue et aléatoire, jamais commitée dans le dépôt
- `PAYMENT_MODE=demo` tant que la passerelle réelle n’a pas été intégrée

### Aperçu public sur Render

Le fichier `render.yaml` prépare un service web Render gratuit, avec construction automatique après connexion du dépôt GitHub privé, contrôle de santé sur `/api/health` et génération d’une clé d’administration. Après connexion du dépôt à Render, créez un Blueprint depuis ce dépôt et vérifiez que le plan sélectionné est bien `free` avant de lancer le service.

Cette configuration sert à prévisualiser le site : l’instance gratuite peut s’arrêter lorsqu’elle est inactive et son système de fichiers n’est pas persistant. Les commandes, messages et changements de stock de démonstration peuvent donc disparaître après un redémarrage. Les paiements restent simulés. Pour vendre réellement, il faudra choisir un hébergement et un stockage persistants, remplacer la clé partagée de l’administration par une authentification avec rôles et intégrer le prestataire de paiement marchand.

### Domaine `wearo.tg`

Le site utilise `https://wearo.tg/` comme URL canonique et ses fichiers SEO (`robots.txt` et `sitemap.xml`) sont prêts pour ce domaine. Pour le rendre accessible sur Internet, il faut d’abord enregistrer le domaine auprès d’un bureau accrédité, puis déployer l’application sur un hébergeur Node.js. Ajoutez ensuite le domaine dans le tableau de bord de cet hébergeur et configurez les enregistrements DNS A/AAAA ou CNAME exactement selon ses instructions. Activez HTTPS sur l’hébergeur avant de communiquer l’adresse. L’aperçu `127.0.0.1` reste uniquement accessible depuis l’ordinateur local.

Le serveur refuse les mutations administrateur sans clé. En production, l’écran d’administration permet de saisir cette clé en mémoire le temps de la session. Pour un vrai lancement public, remplacer cette clé partagée par une authentification administrateur avec sessions sécurisées et rôles, puis remplacer le stockage JSON local par PostgreSQL ou un service managé adapté. Le stockage JSON convient à une démonstration sur un seul processus, pas à plusieurs réplicas ni à une activité soutenue.

## Mobile Money et données réelles

Le checkout propose les rails Flooz et Mixx by Yas dans une interface de démonstration. La passerelle n’est pas encore connectée : aucun paiement réel n’est initié et les commandes restent en attente de confirmation. Au Togo, les opérateurs proposent leurs solutions Mobile Money marchandes ; des agrégateurs tels que [PayGate Global](https://www.paygateglobal.com/) documentent la collecte Flooz/T-Money depuis leur espace marchand. Il faut ouvrir/valider un compte marchand et obtenir le contrat API courant, les identifiants, les URL de retour et les règles de signature du prestataire avant d’écrire son adaptateur serveur. Voir aussi les informations opérateur de [Flooz chez Moov Africa Togo](https://moov-africa.tg/moov-money/marchand-moov-money-flooz/) et [Mixx by Yas](https://yas.tg/mixx-by-yas/).

Ne pas demander ni enregistrer les codes secrets Mobile Money dans la boutique. Le prestataire doit afficher son écran ou USSD sécurisé, puis confirmer la transaction via un callback signé. L’API de démonstration protège ses écritures administrateur, mais ne constitue pas à elle seule une configuration de production pour les paiements ou les comptes clients.

## Choix techniques et limites de démonstration

- React 19, Vite 6 et CSS responsive
- API HTTP Node.js sans dépendance serveur externe
- Données de démonstration persistées sous forme JSON
- Images d’illustration chargées depuis Unsplash
- Les informations de compte et l’historique client sont enregistrés localement dans le navigateur ; une authentification serveur est nécessaire avant la mise en ligne commerciale
- Les pages légales et la politique de retour sont des contenus de départ à faire relire et adapter avant publication

