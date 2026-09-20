# Mise à jour du projet — 20 septembre 2026

Cette migration complète l'audit du 19 septembre. Les changements sont locaux,
sans déploiement ni modification des données de production.

## Versions retenues

Les dépendances directes ont été comparées au registre npm, puis les trois
lockfiles régénérés et réinstallés avec `npm ci`.

| Socle | Version |
| --- | --- |
| Node.js | 24.21.0 LTS, fixé dans `.node-version` |
| npm | 12.0.2 |
| TypeScript | 7.0.2 |
| React / React DOM | 19.3.0 |
| React Router | 7.18.4 |
| Vite / plugin React | 8.3.0 / 6.1.1 |
| Tailwind / plugin Vite | 4.3.3 |
| Express | 5.2.1 |
| Mongoose | 9.10.1 |
| Multer | 2.4.0 |
| Nodemailer | 10.0.10 |
| node-cron | 4.6.0 |
| Zod | 4.6.5 |
| Capacitor core / CLI / Android / iOS | 8.5.2 |
| Notifications locales | 8.3.1 |
| Android Gradle Plugin / Gradle | 8.13.2 / 8.14.5 |

Les autres versions exactes figurent dans les manifestes et lockfiles.
`@types/node` reste en 24.13.6 pour correspondre au runtime Node 24 LTS,
plutôt que de déclarer des API Node 26 indisponibles au lancement.
AGP et Gradle restent dans les branches compatibles avec Capacitor 8.

## Adaptations

- Résolution ESM `NodeNext` côté serveur, types Mongoose adaptés et types intégrés
  de bcrypt/node-cron utilisés sans leurs anciens paquets `@types`.
- Routes de repli compatibles avec Express 5, racine et liens profonds inclus.
  Une URL API inconnue renvoie une erreur JSON 404, pas une page HTML.
- Tailwind 4 intégré directement à Vite ; ancienne configuration PostCSS supprimée.
  Configuration de thème existante conservée explicitement, couleur de bordure
  par défaut préservée et déclaration d'animation invalide corrigée.
- Pages React chargées à la demande avec un état de chargement accessible.
  Le JavaScript principal passe d'environ 612 à 292 ko avant compression
  (179 à 93 ko gzip) ; les autres modules se chargent selon la page visitée.
- iOS migré vers `UIScene` : délégué, déclaration plist et inscription Xcode.
  Le schéma local iOS utilise `capacitor` ; WKWebView réserve `http` et `https`.
- Cible iOS relevée à 16.4 pour Tailwind 4. Android conserve API minimum 24,
  cible/compilation 36 ; il faut JDK 21 et une WebView récente.
- Gradle 8.14.5 avec contrôle SHA-256 de sa distribution.
- Scripts `ci:install`, `audit:all` et `verify`, CI Windows/Linux et Dependabot
  hebdomadaire ajoutés. Les builds ne réinstallent pas les dépendances.

## Dépendances indirectes

Les versions publiées de Capacitor Assets/Xcode incluent encore des dépendances
anciennes. Des overrides ciblés corrigent les avis de sécurité :

- `sharp` 0.35.4 pour Capacitor Assets ;
- `tar` 7.5.22 pour les CLI Capacitor ;
- `uuid` 11.1.1 pour Xcode, en conservant l'interface CommonJS utilisée par ce dernier.

La génération Android/iOS a été exécutée dans une copie temporaire : **89 variantes**
d'icônes/écrans de démarrage générées. La migration Xcode et `cap sync` passent.
Réévaluer ces overrides lorsque les paquets parents auront corrigé leurs versions.

Deux avertissements de dépréciation indirects subsistent malgré les dernières
versions directes : `node-domexception` via Google Auth, et `glob` 9 via le CLI 5
interne à Capacitor Assets. Ils ne correspondent à aucune alerte dans les audits
réalisés. Ils ne sont pas masqués par une mise à jour majeure forcée non validée.

## Vérifications réalisées

- Réinstallation propre des trois projets avec Node 24.21.0 et npm 12.0.2.
- Vérifications TypeScript serveur, interface, Vite et Capacitor : succès.
- **17 tests réussis** : dates/échéances, préférences de notification et routage HTTP.
  Le nouveau test HTTP vérifie racine, liens profonds, fichiers statiques, API 404
  et propagation des erreurs asynchrones avec Express 5.
- Build de production serveur + interface : succès, sans avertissement de gros bundle.
- `npm audit` : **0 vulnérabilité connue** dans chacun des trois projets, outils inclus.
- `npm ls --depth=0` : aucun conflit de dépendances directes.
- Navigation sur connexion, accueil, courses, tâches, Taco, Nono et profil :
  vérifiée dans Edge/Chromium à 1440 et 390 px, API simulée, sans erreur JavaScript
  ni débordement horizontal. Captures locales dans `test-results/` (ignoré par Git).
- Génération des ressources mobiles et synchronisation Android/iOS : succès.

## Limites et lancement

Le Node global du poste reste en 22 : les vérifications ont utilisé un Node 24
isolé dans le cache npm. Activer Node 24 et npm 12 sur le poste et l'hébergement
avant de lancer `npm run ci:install`, puis `npm run verify`.

La compilation APK n'a pas été validée : le poste dispose de Java 17 et des SDK
34/35, alors que Capacitor 8 demande Java 21 et SDK 36. La compilation iOS et les
essais sur téléphone nécessitent macOS/Xcode. La synchronisation ne remplace pas
ces compilations. La CI est ajoutée au dépôt, mais n'a pas encore tourné sur GitHub.

Aucun envoi d'email réel ni accès aux données de production n'a été utilisé pour
ces tests. Les services externes (MongoDB, SMTP, hébergement) ne sont pas mis à jour
par les lockfiles. Les sujets d'architecture de l'audit (sessions multiples,
isolation des foyers, tâches planifiées entre plusieurs instances) restent des
évolutions distinctes : cette migration ne les résout pas à elle seule.

## Références de migration

- [Tailwind 4 et compatibilité navigateur](https://tailwindcss.com/docs/upgrade-guide)
- [Capacitor 8.5 et UIScene](https://capacitorjs.com/docs/updating/8-5)
- [Schémas locaux Capacitor](https://capacitorjs.com/docs/config)
- [Express 5](https://expressjs.com/en/guide/migrating-5.html)
- [Mongoose 9](https://mongoosejs.com/docs/migrating_to_9.html)
- [AGP 8.13](https://developer.android.com/build/releases/agp-8-13-0-release-notes)
- [Gradle 8.14.5](https://docs.gradle.org/8.14.5/release-notes.html)
