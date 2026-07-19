# 🏡 Home Application

A **personal home management web application** built with the **MERN stack** (MongoDB, Express.js, React, Node.js).  
It helps you **organize your daily life** by managing tasks, shopping, events, and even your pet's vaccines.  

---

## ✨ Features

- **🛒 Shopping List**  
  Add, edit, and check items for your daily and weekly shopping.

- **🗓️ Agenda & Events**  
  Manage appointments and personal reminders with an intuitive calendar.

- **💉 Pet Vaccine Tracking**  
  Track your dog’s vaccinations and health milestones.

- **📱 Responsive UI**  
  Works on desktop, tablet, and mobile.

---

## 🚀 Tech Stack

**Frontend:**  
- React  
- Vite / Create React App (depending on your setup)  
- Tailwind CSS or CSS Modules  

**Backend:**  
- Node.js  
- Express.js  

**Database:**  
- MongoDB + Mongoose  

**Others:**  
- Axios for API calls  
- JSON Web Token (JWT) for authentication (if implemented)  

---

## 📦 Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/home-application.git
   cd home-application
   ```

2. **Install all dependencies**  
   ```bash
   npm run install:all
   ```
   
   Ou manuellement :
   ```bash
   npm install
   cd server && npm install
   cd server/client && npm install
   ```

3. **Configure environment variables**  
   Create a `.env` file in the `server` folder with:  
   
   **Variables obligatoires :**
   ```env
   # Connexion MongoDB (obligatoire)
   # Format local : mongodb://localhost:27017
   # Format MongoDB Atlas : mongodb+srv://username:password@cluster.mongodb.net
   DB_URI=mongodb://localhost:27017
   
   # Clé secrète JWT (obligatoire)
   # Utilisez une clé longue et aléatoire en production (minimum 32 caractères recommandé)
   # Vous pouvez générer une clé avec : openssl rand -base64 32
   SECRET=votre_cle_secrete_jwt_tres_longue_et_aleatoire_ici
   
   # Code d'invitation requis pour créer un compte par email/mot de passe (obligatoire pour
   # autoriser l'inscription : sans cette variable, la création de compte est désactivée).
   # Note : la connexion Google ne crée jamais de nouveau compte, elle ne fait que connecter
   # un compte déjà existant. Seule l'inscription email/mot de passe passe par ce code.
   # Partagez ce code uniquement avec les personnes que vous invitez dans le foyer.
   REGISTRATION_CODE=un_code_secret_a_partager_avec_ta_famille
   ```
   
   **Variables optionnelles :**
   ```env
   # Port du serveur backend (défaut: 4000)
   PORT=4000
   
   # Environnement (défaut: development)
   NODE_ENV=development
   
   # URL du frontend pour CORS en production
   FRONTEND_URL=http://localhost:5173
   
   # Email pour l'envoi de rappels (optionnel)
   # Pour Gmail, créez un "Mot de passe d'application" dans les paramètres Google
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASS=votre_mot_de_passe_application
   
   # Destinataires des emails de rappel pour Taco (optionnel)
   EMAIL_RECIPIENT_1=email1@example.com
   EMAIL_RECIPIENT_2=email2@example.com
   
   # Cle API Anthropic pour l'assistant IA de liste de courses (optionnel)
   # Sans cette cle, cliquer sur "Generer avec l'IA" dans l'onglet Courses renvoie une erreur explicite
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   
   **Exemple complet minimal :**
   ```env
   DB_URI=mongodb://localhost:27017
   SECRET=ma_super_cle_secrete_123456789_abcdefghijklmnopqrstuvwxyz
   PORT=4000
   ```
   
   **Note sur la sécurité :**
   - Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule et un chiffre
   - Les tokens JWT expirent après 7 jours (au lieu de 20 jours précédemment)
   - Le rate limiting est activé (100 requêtes par IP toutes les 15 minutes)

4. **Run the application**  
   
   **Option 1 : Lancer les deux serveurs en une seule commande** (recommandé)
   ```bash
   npm run dev
   ```
   
   **Option 2 : Lancer séparément**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

5. **Accéder à l'application**  
   - Frontend : **http://localhost:5173** (ou le port affiché dans le terminal)
   - Backend API : **http://localhost:4000**

---

## 📱 Application mobile (Android / iPhone)

Le même projet produit aussi une app native Android et iOS via **Capacitor** : le build web (`server/client/dist`) est embarqué dans une coquille native, sans dupliquer le code. Tout se passe dans `server/client/`.

### Prérequis

- **Android** : [Android Studio](https://developer.android.com/studio) (inclut le SDK + un JDK compatible). Fonctionne sur Windows/macOS/Linux.
- **iOS** : un **Mac** avec [Xcode](https://apps.apple.com/app/xcode/id497799835) installé — impossible de compiler/tester la version iPhone depuis Windows. Le dossier `ios/` peut être généré depuis Windows, mais il faudra l'ouvrir sur un Mac pour la suite.
- Un compte développeur [Google Play Console](https://play.google.com/console) (payant, une fois) et/ou [Apple Developer](https://developer.apple.com/programs/) (payant, annuel) pour publier sur les stores.

### Construire et synchroniser

Depuis `server/client/` :

```bash
npm run cap:sync      # build web (vite build) + copie dans android/ et ios/
npm run cap:android   # build + ouvre le projet dans Android Studio
npm run cap:ios       # build + ouvre le projet dans Xcode (Mac uniquement)
```

Relance `npm run cap:sync` après chaque changement de code avant de rebuild l'app native. `android/` et `ios/` sont versionnés dans git (ce sont des projets natifs à part entière, pas juste du cache) ; seuls leurs artefacts de build (`.gradle`, `build/`, `Pods/`, `local.properties`, les clés de signature `.jks`/`.keystore`/`keystore.properties`...) sont ignorés.

### Distribution Android sans Play Store (sideload)

Pour installer l'app directement sur vos téléphones sans passer par le Play Store :

```bash
npm run android:release
```

Ça produit un APK **signé** (pas debug) dans `android/app/build/outputs/apk/release/app-release.apk`, à envoyer directement (email, drive, clé USB...). Chaque personne doit activer *"Installer les applications inconnues"* pour l'app utilisée pour ouvrir le fichier (Fichiers, Gmail...), puis taper dessus pour installer.

La signature est configurée via `android/keystore.properties` (jamais commité — voir `keystore.properties.example` pour le modèle). **Le mot de passe de cette clé ne se régénère pas** : perds-le et tu ne pourras plus republier de mise à jour sous la même identité (il faudrait redésinstaller l'app sur chaque téléphone). Garde-le dans un gestionnaire de mots de passe, pas juste dans ce fichier.

### Pointer l'app mobile vers ton backend déployé

Le site web utilise des chemins relatifs (`/api/...`) car il est servi par le même serveur que l'API. L'app mobile, elle, est chargée depuis le bundle embarqué (`https://localhost`) et doit connaître l'URL complète de ton backend en ligne. Avant de builder pour mobile, crée `server/client/.env.production` (ou passe la variable au moment du build) :

```env
VITE_API_BASE_URL=https://ton-domaine-de-production.com
```

Sans cette variable, l'app mobile tenterait d'appeler l'API sur son propre bundle local et échouerait. Le CORS backend autorise déjà les origines Capacitor (`https://localhost`, `capacitor://localhost`) en plus du site web.

### Identité de l'app

- **App ID** : `com.davinhub.app` (dans `capacitor.config.ts`) — **à figer avant la première publication** sur les stores : le changer après coup revient à publier une toute nouvelle app (perte des avis, des installs, etc.).
- **Nom / icône / écran de démarrage** : définis dans `capacitor.config.ts` et générés depuis `server/client/resources/icon.png` (+ `splash.png` / `splash-dark.png`). Pour les régénérer après avoir changé le logo :
  ```bash
  npx capacitor-assets generate
  ```

### Limitation connue : connexion Google

Le bouton "Connexion avec Google" utilise le SDK web de Google (Google Identity Services), que Google restreint dans les WebView embarquées (comme celle de Capacitor) — il peut refuser de s'ouvrir sur mobile. La connexion par email/mot de passe fonctionne normalement partout. Corriger ça proprement demanderait un plugin Capacitor dédié (ex. `@codetrix-studio/capacitor-google-auth`) avec sa propre configuration OAuth par plateforme dans Google Cloud Console — pas encore mis en place.

### Live reload en dev (optionnel)

Pour recharger l'app native en direct depuis le serveur Vite pendant le développement, au lieu de rebuild à chaque fois :

```bash
CAP_SERVER_URL=http://<ton-ip-locale>:5173 npx cap run android
```

(remplace par ton IP locale, pas `localhost`, pour que le téléphone/l'émulateur puisse l'atteindre)

---

## 🛠️ Future Improvements  
- ✅ Push notifications for reminders

---

## 👨‍💻 Author

**Clément Davin**
