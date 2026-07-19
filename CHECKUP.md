# Nettoyage du projet — 18 septembre 2026

## Changements

- Calendrier retiré de la navigation, des routes React, du profil, de l'API Express, des types et du contexte partagé.
- Composants, contrôleurs, modèle et styles du calendrier supprimés. Les sélecteurs de dates des soins restent disponibles.
- Les anciennes notifications locales du calendrier sont annulées à la prochaine ouverture de l'application native. Les rappels des tâches et des soins restent actifs.
- Composant `PostList`, anciens hooks de dates et utilitaires inutilisés supprimés. Les fonctions de dates de Coco, Nono et des notifications sont regroupées et rejettent les dates impossibles.
- Dépendances inutilisées retirées : calendrier, sélecteur d'heure, lien du frontend vers le package backend, anciennes bibliothèques GridFS et types superflus. Les outils Capacitor sont classés dans les dépendances de développement.
- Ancienne commande ESLint sans configuration remplacée par `npm run check`. TypeScript et les tests sont maintenant déclarés explicitement dans chaque projet.
- Mises à jour compatibles appliquées aux dépendances et fichiers de verrouillage. Documentation actualisée.

## Vérifications

- `npm run check` : serveur et interface valides.
- `npm test` : 13 tests réussis, dont calcul des échéances, dates invalides, annulation des anciennes notifications et conservation des rappels actifs.
- `npm run build` : compilation du serveur et de l'interface réussie.
- Recherche des anciennes routes et imports : aucune référence active au module calendrier.
- Les tests de notifications utilisent un faux appareil. Aucune connexion à une base réelle, aucun envoi d'email, aucun test sur téléphone ni déploiement n'a été effectué.

Le build suppose que les dépendances sont installées (`npm run install:all` depuis la racine). Le JavaScript principal produit pèse environ 512 ko avant compression ; Vite signale encore le seuil de 500 ko. Un chargement des pages à la demande pourrait réduire le téléchargement initial.

## Audit des dépendances restant à traiter

Résultats de `npm audit`, après application des correctifs compatibles, à la date ci-dessus. Les nombres correspondent aux paquets signalés, y compris les dépendances transitives, et ne prouvent pas que chaque vulnérabilité soit exploitable dans cette application.

| Périmètre | Résultat |
| --- | --- |
| Serveur, production (`--omit=dev`) | 7 alertes : 4 élevées, 3 modérées ; aucune critique |
| Interface, production (`--omit=dev`) | 2 alertes modérées ; aucune élevée ou critique |
| Interface, développement inclus | 12 alertes : 1 critique, 4 élevées, 7 modérées |

Travaux à prévoir :

- **Multer** et ses dépendances : migration vers la version majeure corrigée, avec vérification des uploads et du rejet des fichiers invalides.
- **Nodemailer** : migration majeure et vérification du transport SMTP et des emails de rappel/réinitialisation.
- **node-cron**, **gaxios/uuid** : examiner les dépendances et vérifier les tâches programmées et la connexion Google après mise à jour.
- **React Router** : migration majeure et vérification de la navigation et des routes authentifiées.
- **Vite/esbuild** et **outillage mobile** : examiner les mises à jour majeures et les dépendances transitives de `@capacitor/assets` (`sharp`, `tar`, `xcode/uuid`). L'audit ne propose pas de correctif automatique pour toutes ces chaînes.

Les migrations majeures n'ont pas été forcées pendant ce nettoyage. Les anciennes données du calendrier présentes dans MongoDB n'ont pas été supprimées.
