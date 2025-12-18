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
   # Utilisez une clé longue et aléatoire en production
   # Vous pouvez générer une clé avec : openssl rand -base64 32
   SECRET=votre_cle_secrete_jwt_tres_longue_et_aleatoire_ici
   ```
   
   **Variables optionnelles (pour l'envoi d'emails) :**
   ```env
   # Email pour l'envoi de rappels (optionnel)
   # Pour Gmail, créez un "Mot de passe d'application" dans les paramètres Google
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASS=votre_mot_de_passe_application
   ```
   
   **Exemple complet minimal :**
   ```env
   DB_URI=mongodb://localhost:27017
   SECRET=ma_super_cle_secrete_123456789_abcdefghijklmnopqrstuvwxyz
   ```

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

## 🛠️ Future Improvements  
- ✅ Push notifications for reminders

---

## 👨‍💻 Author

**Clément Davin**
