# Audit technique — Home Application

Date : 19 septembre 2026. Révision auditée : `0f0e304` (feat: Add Home Page).

## Conclusion

Le choix React + TypeScript + Express + MongoDB + Capacitor reste cohérent pour une application familiale web/mobile évolutive. Le projet compile, mais il n'est pas entièrement à jour. Vite 5 est hors support et Multer 1.4.4 est explicitement déprécié. Plusieurs dépendances installées sont concernées par des avis de sécurité.

La priorité est de corriger les dépendances exposées et de fiabiliser les notifications et les sessions, puis de mieux organiser les fonctionnalités. Une architecture de monolithe modulaire convient à cette application : une API, des modules métier et un traitement des notifications séparé lorsque nécessaire.

Il s'agit d'un audit et d'une proposition de migration. Aucune dépendance, donnée utilisateur ou configuration de production n'a été modifiée.

## Méthode et limites

- Lecture des trois manifestes npm et des lockfiles ; comparaison des dépendances directes installées avec le tag `latest` du registre npm via `npm outdated --json`.
- 52 entrées de dépendances directes contrôlées, dont 38 en retard sur `latest` ; TypeScript et tsx sont comptés dans chacun des deux projets où ils sont déclarés.
- Audits npm complets et `--omit=dev` dans les trois projets.
- Lecture des routes, modèles, contrôleurs, mécanismes de session, notifications, chargement des données et configurations web/mobile.
- `npm run build` réussi : vérifications TypeScript serveur/client et génération du frontend.
- `npm test` réussi : 11 tests serveur et 5 tests client.
- Pas de test de charge, de test d'intrusion, d'accès à la configuration de production, de contrôle de la version du serveur MongoDB ou de test sur téléphone. Aucun email de test envoyé.
- Les versions Android/iOS du dépôt ont été comparées aux prérequis Capacitor ; les dernières versions de chaque bibliothèque native transitive n'ont pas été auditées. Aucune compilation native Android/iOS exécutée.
- Les alertes npm comptent des paquets affectés, y compris leurs dépendants ; elles ne représentent pas autant de failles indépendantes ni la preuve d'une exploitation dans cette application.

## Versions

Les colonnes indiquent la version réellement installée, la version maximale permise par le manifeste actuel (`wanted`) et la dernière publication stable indiquée par npm (`latest`). Les versions sont un instantané et doivent être relues au moment de la migration.

| Projet | Dépendance | Installée | Compatible avec la plage actuelle | Latest npm |
|---|---|---|---|---|
| Racine | concurrently | 8.2.2 | 8.2.2 | 10.0.5 |
| Serveur | @anthropic-ai/sdk | 0.111.0 | 0.111.0 | 0.127.0 |
| Serveur | @types/multer | 2.0.0 | 2.2.0 | 2.2.0 |
| Serveur | @types/node | 25.0.3 | 25.9.8 | 26.6.2 |
| Serveur | @types/nodemailer | 7.0.4 | 7.0.12 | 8.0.2 |
| Serveur | bcryptjs | 2.4.3 | 2.4.3 | 3.0.3 |
| Serveur | cors | 2.8.5 | 2.8.6 | 2.8.6 |
| Serveur | dotenv | 16.4.5 | 16.6.1 | 18.0.1 |
| Serveur | express | 4.22.3 | 4.22.3 | 5.2.1 |
| Serveur | google-auth-library | 9.15.1 | 9.15.1 | 11.1.0 |
| Serveur | helmet | 8.1.0 | 8.3.0 | 8.3.0 |
| Serveur | jsonwebtoken | 9.0.2 | 9.0.3 | 9.0.3 |
| Serveur | mongoose | 8.24.4 | 8.24.4 | 9.10.1 |
| Serveur | multer | 1.4.4 | 1.4.4 | 2.4.0 |
| Serveur | node-cron | 3.0.3 | 3.0.3 | 4.6.0 |
| Serveur | nodemailer | 6.10.1 | 6.10.1 | 10.0.10 |
| Serveur | nodemon | 3.1.11 | 3.1.14 | 3.1.14 |
| Serveur | tsx | 4.21.0 | 4.23.13 | 4.23.13 |
| Serveur | typescript | 5.9.3 | 5.9.3 | 7.0.2 |
| Serveur | zod | 4.2.1 | 4.6.5 | 4.6.5 |
| Client | @capacitor/android | 8.4.2 | 8.5.2 | 8.5.2 |
| Client | @capacitor/cli | 8.4.2 | 8.5.2 | 8.5.2 |
| Client | @capacitor/core | 8.4.2 | 8.5.2 | 8.5.2 |
| Client | @capacitor/ios | 8.4.2 | 8.5.2 | 8.5.2 |
| Client | @capacitor/local-notifications | 8.2.1 | 8.3.1 | 8.3.1 |
| Client | @types/react | 18.3.3 | 18.3.31 | 19.3.0 |
| Client | @types/react-dom | 18.3.0 | 18.3.7 | 19.3.0 |
| Client | @vitejs/plugin-react | 4.3.1 | 4.7.0 | 6.1.1 |
| Client | autoprefixer | 10.4.19 | 10.6.1 | 10.6.1 |
| Client | date-fns | 3.6.0 | 3.6.0 | 4.4.0 |
| Client | react | 18.3.1 | 18.3.1 | 19.3.0 |
| Client | react-datepicker | 7.3.0 | 7.6.0 | 9.1.0 |
| Client | react-dom | 18.3.1 | 18.3.1 | 19.3.0 |
| Client | react-router-dom | 6.30.6 | 6.30.6 | 7.18.4 |
| Client | tailwindcss | 3.4.4 | 3.4.19 | 4.3.3 |
| Client | tsx | 4.21.0 | 4.23.13 | 4.23.13 |
| Client | typescript | 5.9.3 | 5.9.3 | 7.0.2 |
| Client | vite | 5.4.21 | 5.4.21 | 8.3.0 |

Les 14 entrées restantes ne sont pas signalées en retard : serveur — express-rate-limit 8.7.0, winston 3.19.0, @types/bcryptjs 2.4.6, @types/cors 2.8.19, @types/express 5.0.6, @types/jsonwebtoken 9.0.10 et @types/node-cron 3.0.11 ; client — @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0, @dnd-kit/utilities 3.2.2, @fortawesome/fontawesome-free 7.3.1, jwt-decode 4.0.0, @capacitor/assets 3.0.5 et postcss 8.5.28. Être à `latest` ne garantit ni compatibilité entre paquets ni absence de vulnérabilités transitives.

Source des versions : registre npm, interrogé par `npm outdated` et `npm view`, par exemple [Vite](https://registry.npmjs.org/vite/latest) et [TypeScript](https://registry.npmjs.org/typescript/latest).

### Runtime, maintenance et compatibilité

- Node local : **22.17.1** ; npm local : **11.6.4**. Node 22 reste une ligne LTS, mais son patch local est ancien. Cible recommandée : **Node 24.21.0 LTS** pour le développement, la CI et la production, avec `engines` et un fichier de version. Node 26.9.0 est la dernière version Current observée, ce qui n'en fait pas la cible de production recommandée. [Politique Node.js](https://nodejs.org/en/about/previous-releases)
- **Vite 5 est hors support**. Migrer vers une ligne maintenue, cible finale 8.3.0 avec le plugin React compatible. La migration Vite 8 change aussi l'outillage de compilation et certaines cibles navigateur. [Support Vite](https://vite.dev/releases), [migration](https://vite.dev/guide/migration)
- React 18 n'est pas une preuve que l'application entière est obsolète ; React 19 et React Router 7 sont des migrations à valider sur les formulaires, le glisser-déposer et le sélecteur de dates. [Versions React](https://react.dev/versions)
- Express **4.x** est associé à **@types/express 5.x**, Multer **1.x** à ses types **2.x**, Nodemailer **6.x** à ses types **7.x** et Node **22** à ses types **25**. Les compilations réussies ne garantissent pas l'exactitude de ces contrats. Aligner chaque paire pendant sa migration.
- Express 5 exige notamment d'adapter `app.get("*", ...)` dans `server/server.ts` : le wildcard doit être nommé, et le fallback SPA doit continuer à couvrir la racine. [Guide Express 5](https://expressjs.com/en/guide/migrating-5/)
- TypeScript 7 nécessite une revue de configuration ; le serveur ESM utilise encore `moduleResolution: "node"`, ancien mode node10. Cible : mode NodeNext pour le serveur ; conserver bundler pour le client. [Modes TypeScript](https://www.typescriptlang.org/tsconfig/moduleResolution.html)
- Tailwind 4 implique une migration de la configuration, du plugin de compilation et de nombreux usages CSS/`@apply`. Prévoir des vérifications visuelles mobile et sombre. [Guide Tailwind](https://tailwindcss.com/docs/upgrade-guide)
- Mongoose 9 doit faire l'objet d'une migration avec validation des requêtes, des types et des hooks, après contrôle de la version MongoDB réelle. [Guide Mongoose](https://mongoosejs.com/docs/migrating_to_9.html)
- Capacitor 8.4.2 est proche de la version actuelle. Android SDK 36, AGP 8.13.0 et Gradle 8.14.3 correspondent au socle documenté pour Capacitor 8 ; iOS cible 15.0. La montée 8.5 inclut une évolution du cycle de vie iOS UIScene, notamment pour Xcode 27 : ne pas traiter cette mineure comme un simple changement de numéro. Le chemin Windows présent dans `ios/App/CapApp-SPM/Package.swift` doit aussi être régénéré/vérifié sur macOS. [Capacitor 8](https://capacitorjs.com/docs/updating/8-0), [migration 8.5](https://capacitorjs.com/docs/updating/8-5)
- Le lockfile marque aussi des dépendances transitives des outils d'assets comme dépréciées : glob, tar, prebuild-install et uuid. Après migration bcryptjs 3, vérifier la suppression de `@types/bcryptjs`, les types étant fournis par bcryptjs.

## Sécurité des dépendances

| Arbre npm | Audit complet | Avec omit=dev |
|---|---|---|
| Racine | 2 : 1 haute, 1 critique | 0 |
| Serveur | 7 : 4 hautes, 3 modérées | 7 : 4 hautes, 3 modérées |
| Client | 12 : 1 critique, 4 hautes, 7 modérées | 2 modérées |

Les totaux entre projets ne doivent pas être additionnés comme des vulnérabilités uniques.

1. **Priorité immédiate : Multer 1.4.4 et sa chaîne busboy/dicer.** Le middleware multipart est effectivement utilisé par la route authentifiée `POST /api/taco/upload`, avec stockage mémoire et taille maximale de 10 Mo. L'authentification réduit l'exposition, mais ne corrige pas les vulnérabilités du parseur. Cible npm observée : 2.4.0. Tester upload valide, format refusé, requête malformée et dépassement de taille. Source locale : `server/routes/TacoRoutes.ts`, `server/controllers/TacoController.ts`.
2. **Nodemailer 6.10.1 : alertes hautes.** Le paquet est utilisé pour rappels et réinitialisation de mot de passe. Migrer avec ses types, puis valider expéditeur, destinataire, refus SMTP et échec partiel. Cible npm observée : 10.0.10. Aucun scénario d'exploitation testé.
3. **Vite/esbuild : alertes concernant notamment le serveur de développement.** Ce risque diffère de celui du frontend statique déployé. Il reste pertinent sur cette machine Windows.
4. **React Router : deux paquets affectés dans l'arbre de production client.** Certains avis concernent SSR/hydratation alors que l'application utilise BrowserRouter côté client ; analyser les chemins concernés plutôt que supposer tous les avis exploitables.
5. **Outils d'assets Capacitor : alertes hautes et critique transitives**, notamment tar/sharp. Le paquet direct est à latest mais npm ne propose pas de correction automatique pour toute la chaîne. Évaluer remplacement, retrait si inutilisé ou mise à jour compatible des dépendances ; éviter les overrides non testés.
6. **node-cron/uuid et gaxios/uuid : alertes modérées.** Prévoir leur mise à niveau avec vérification du comportement des rappels et de Google Login.

Sources précises des avis accessibles via les sorties `npm audit --json`, par exemple [Multer](https://github.com/advisories/GHSA-44fp-w29j-9vj5), [Vite](https://github.com/advisories/GHSA-fx2h-pf6j-xcff), [React Router](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6).

## Architecture et fiabilité

### P1 — Notifications : doublons, reprises et synchronisation

Constats dans `server/controllers/{Taco,Nono,ReminderPosts}Controller.ts` : les crons sont lancés à l'import des contrôleurs. Chaque instance web lancerait ses propres jobs. Le contrôle `dueDateNotifiedAt` est lu avant l'envoi puis écrit ensuite, sans réservation atomique. Deux instances peuvent donc traiter le même rappel.

De plus, `sendReminderEmails` peut retourner `sent: 0` sans erreur quand aucun compte n'est abonné ; le cron des tâches marque malgré tout la tâche comme notifiée. En cas de succès partiel, les échecs par destinataire ne sont pas conservés pour reprise. Un échec peut aussi interrompre la boucle de traitement des tâches.

Le hook mobile dépend seulement de `enabled`. Changer un soin pendant que l'application reste ouverte ne reprogramme pas automatiquement les notifications. Une préférence modifiée sur un autre appareil ne peut pas annuler immédiatement les notifications locales déjà programmées sur un téléphone hors ligne. Les contrôles `cancelled` actuels n'organisent pas non plus les synchronisations successives dans une file ; une ancienne opération peut annuler le résultat d'une activation plus récente.

Recommandation : extraire le service de notification, journaliser les tentatives par destinataire et échéance, réserver atomiquement les jobs avec un bail, gérer reprises et absence d'abonnés explicitement. Sérialiser la synchronisation mobile, la relancer après mutation et à la reprise de l'application. Pour l'IoT distant, prévoir un canal push serveur et son suivi par appareil. Ne pas promettre une livraison exactement une fois via SMTP ; viser une reprise fiable avec déduplication.

### P1 — Sessions sur plusieurs appareils

`server/controllers/UsersController.ts:92` remplace le seul `refreshToken` du compte à chaque émission de session. Un login/rafraîchissement sur un autre appareil peut invalider le renouvellement du premier. Cela concerne déjà un usage téléphone + navigateur.

Les access tokens ont par défaut 30 jours, les refresh tokens 60 jours ; les deux sont stockés dans localStorage côté client. Déconnexion et reset effacent le refresh token, mais le middleware ne révoque pas un access token déjà émis et toujours valide.

Recommandation : sessions distinctes par appareil, refresh tokens hachés et révocables, durée d'accès plus courte avec renouvellement transparent. Pour le web, étudier les cookies HttpOnly avec protection CSRF adaptée ; pour le natif, un stockage sécurisé adapté. Ne pas raccourcir seulement la durée sans corriger le mécanisme multiappareil.

Autre limite fonctionnelle : le contrôle de profil interdit aussi aux comptes readonly de changer leur propre préférence de notification. Séparer préférence personnelle et droit de modifier les données du foyer.

### P1 avant plusieurs instances — Exploitation

`server/server.ts` utilise un rate limiter sans store partagé : les quotas sont locaux au processus. Derrière un proxy, vérifier la configuration réelle de `trust proxy` et les adresses utilisées ; un quota IP commun peut affecter toute la famille. Une éventuelle multiplication des instances impose un store partagé. [Documentation du store](https://express-rate-limit.mintlify.app/reference/stores)

Aucun endpoint dédié de disponibilité ni arrêt propre sur SIGTERM n'a été trouvé. Ajouter sondes de vie/disponibilité et fermeture des connexions. Aucune procédure de sauvegarde/restauration ou configuration de CI n'a été trouvée dans le dépôt ; cela ne prouve pas leur absence chez l'hébergeur. Vérifier et tester la restauration avant les migrations de données.

### P2 — Modèle métier évolutif

Coco et Nono sont des documents globaux retrouvés par `findOne()` sans identifiant métier. Les noms et valeurs initiales sont codés dans les contrôleurs/contextes. Les créations « lire puis créer » n'imposent pas l'unicité du document singleton.

C'est adapté à un seul foyer actuel, mais pas à l'ajout simple de plusieurs animaux/enfants. Introduire progressivement des profils identifiés et des soins associés, sans imposer immédiatement la gestion de plusieurs foyers. Avant d'ouvrir à d'autres familles, il faudrait ajouter appartenance au foyer et filtrage serveur systématique ; le champ `user` actuel correspond souvent à l'auteur et ne constitue pas une isolation des foyers.

Dates de soins en DD/MM/YYYY, dates des tâches en Date et pesées en YYYY-MM-DD : définir des contrats explicites pour dates sans heure et instants horodatés. Le fuseau du cron règle son déclenchement ; les appels `new Date()`/`setHours()` du traitement restent dépendants du fuseau du processus.

### P2 — Accès aux données

Les endpoints de tâches/courses chargent toutes les données (`ReminderPost.find()`, `ShoppingDay.find()`). L'accueil charge aussi les quatre ressources complètes. L'historique des pesées est un tableau croissant dans le document Nono ; les modèles concernés n'ont pas d'index métier dédiés aux tris et échéances.

Prévoir pagination et projections pour les listes qui grandissent ; extraire les historiques dans des collections dédiées quand nécessaire ; créer les index en fonction des requêtes et les vérifier avec explain. Un endpoint de résumé d'accueil peut réduire les transferts.

Les images sont chargées en mémoire puis stockées en Buffer MongoDB. Cela convient au petit volume actuel. Prévoir quotas et validation du contenu ; si les documents se multiplient, externaliser les binaires vers du stockage objet en conservant leurs métadonnées et autorisations dans l'API.

### P2 — Organisation React et TypeScript

Points déjà solides : composants fonctionnels, hooks, TypeScript strict, contrôleurs de requêtes centralisés, Zod sur plusieurs routes, réponses API normalisées et composants de soins réutilisables.

Points à améliorer :

- `ShoppingTab.tsx` : environ 1 300 lignes ; `app.css` : environ 4 200 lignes. Découper par fonctionnalité et responsabilité.
- `AppContext` contient toutes les données serveur. Les pages font leurs propres chargements ; pas de cache partagé avec invalidation après modification. Introduire une couche de cache de requêtes ou des hooks métier cohérents, puis gérer reconnexion et erreurs. React documente les limites du chargement manuel dans les effets. [Documentation React](https://react.dev/reference/react/useEffect)
- `Home.tsx` peut afficher zéro/« tout est à jour » avant chargement ou garder des données anciennes après échec partiel. Distinguer indisponible, chargement, vide et succès.
- Les routes sont importées immédiatement : le build produit un chunk JS principal de **515,12 ko** (151,54 ko gzip) et CSS **215,33 ko** (46,24 ko gzip). Le warning de taille est un signal à mesurer sur mobile, pas une preuve de lenteur. Le chargement des pages à la demande est une première amélioration raisonnable.
- Les types User du client utilisent des chaînes pour des booléens ; les types de domaine/API sont dupliqués. Partager les contrats validés et convertir à la frontière du stockage.
- Réduire les `any` dans l'authentification/validation, éviter d'utiliser les types de documents Mongoose comme simples objets de requête.
- Aucun lint, formatage automatisé ou configuration d'actualisation des dépendances trouvé dans le dépôt. Installer des règles React Hooks/TypeScript et une vérification automatique des changements.
- Les tests actuels couvrent surtout dates, calcul des soins et helpers de notifications. Ajouter des tests d'intégration pour droits, sessions, uploads, échecs de notification et quelques parcours utilisateur web/mobile.

Ces constats incluent les ajouts récents de l'accueil et des notifications : leur build réussi ne signifie pas qu'ils sont déjà prêts pour plusieurs instances et appareils.

## Ordre de migration proposé

### Lot 1 — Versions sûres et garde-fous

1. Figer une ligne Node LTS commune et rendre l'installation reproductible avec npm ci.
2. Ajouter une CI build/test/lint et des tests d'intégration sur les parcours touchés.
3. Corriger Multer, Nodemailer et leurs dépendances/types par changements isolés.
4. Migrer Vite/plugin React et React Router, puis auditer à nouveau les dépendances de production et les outils.
5. Traiter explicitement les alertes transitives sans correction automatique.

Critères : upload nominal/malformé contrôlé ; authentification fonctionnelle ; erreurs SMTP testées avec transport simulé ; nouvelle analyse des avis de sécurité ; aucune alerte haute de production laissée sans analyse documentée.

### Lot 2 — Maintenabilité

1. Mettre à niveau React/React DOM/types et les composants liés ensemble.
2. Migrer Express et TypeScript avec configuration/types cohérents.
3. Migrer Mongoose après vérification MongoDB ; migrer Tailwind avec contrôle visuel.
4. Découper les écrans, partager les contrats et améliorer le cache/invalidation.
5. Centraliser l'installation via des workspaces npm si cela simplifie réellement les trois projets.

Critères : connexion, courses, tâches, soins, accueil et thème vérifiés ; chargements et erreurs explicites ; régression mobile contrôlée.

### Lot 3 — Croissance et IoT

1. Corriger les sessions multiappareils et les préférences personnelles.
2. Extraire le traitement des notifications avec réservation persistante, reprise et état par destinataire.
3. Ajouter profils/soins identifiés, pagination, index et archivage selon les volumes.
4. Ajouter disponibilité, supervision et restauration testée.
5. Intégrer Home Assistant/Node-RED par un module serveur dédié, avec événements identifiés et commandes autorisées.

Critères : deux appareils restent connectés ; une modification se reflète dans les rappels ; deux instances ne traitent pas librement le même job ; simulation d'échec/reprise ; futur connecteur IoT sans secrets embarqués dans le frontend.

Pour le besoin familial actuel, commencer par les lots 1 et la fiabilisation des sessions/notifications. La séparation en nombreux services et une infrastructure distribuée complète ne sont pas nécessaires pour ajouter des fonctionnalités.

