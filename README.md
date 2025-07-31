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

2. **Install backend dependencies**  
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**  
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**  
   Create a `.env` file in the `server` folder with:  
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

5. **Run the application**  
   In two separate terminals:  
   ```bash
   # Backend
   cd server
   npm run dev

   # Frontend
   cd client
   npm run dev
   ```

6. Open your browser at **http://localhost:5173** (or the port shown in terminal).

---

## 🛠️ Future Improvements  
- ✅ Push notifications for reminders

---

## 👨‍💻 Author

**Clément Davin**
