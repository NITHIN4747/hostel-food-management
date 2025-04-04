Hostel Food Management System

📖 Overview

The Hostel Food Management System is a web-based platform designed to efficiently manage hostel meal planning, kitchen inventory, and student meal attendance. It streamlines food distribution, reduces waste, and enhances meal tracking.


🚀 Features


🔹 Admin Dashboard

📊 Overview Statistics (Total students, Today's Meal Attendance, Available Inventory)

👥 User Management (Add/remove students & kitchen staff, View attendance records)

📅 Meal Planning & Scheduling (Update menus, Track student meal preferences)

📦 Inventory Management (Stock updates, Low-stock alerts)

📋 Basic Reports (Daily meal consumption, Food stock levels)



🔹 Kitchen Supervisor Dashboard

🍽 Daily Meal Attendance Tracking

🛒 Food Stock Usage & Reordering

📢 Meal Notifications for Students

🔄 Task Assignment for Kitchen Staff



🔹 Student Portal

✅ Meal Registration & Preferences

📢 Notifications on Meal Timings & Menu Updates

📝 Feedback System (Rate meals, Provide suggestions)



🛠️ Tech Stack

Frontend: React, Tailwind CSS, Vite

Backend: Node.js, Express, Firebase

Database: Firebase Firestore

Authentication: Firebase Auth



🔧 Installation

1️⃣ Clone the Repository

git clone https://github.com/your-username/hostel-food-management.git
cd hostel-food-management

2️⃣ Install Dependencies

npm install

3️⃣ Setup Environment Variables

Create a .env file in the root directory and add your Firebase credentials:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

4️⃣ Run the Project

npm run dev

Access the project at http://localhost:5173/



📂 Project Structure

📦 hostel-food-management
 ┣ 📂 src
 ┃ ┣ 📂 components  # Reusable UI components
 ┃ ┣ 📂 pages       # Dashboard, Login, Supervisor Pages
 ┃ ┣ 📂 hooks       # Custom React hooks
 ┃ ┣ 📂 context     # Global state management
 ┃ ┣ 📂 firebase    # Firebase configurations
 ┃ ┣ 📜 App.jsx     # Main application file
 ┣ 📜 package.json  # Dependencies
 ┣ 📜 README.md     # Project documentation

 

📝 Future Enhancements

📌 AI-based meal prediction

📌 Mobile App Support

📌 Integration with Payment Gateway for meal charges



🚀 Developed by TrioLogic for Hackathon

👥 Team Members

NITHIN. K - Team Lead

RAGHUL .N.S

THIBISH .D


