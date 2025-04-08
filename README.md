🍽️ Hostel Food Management System

A smart, efficient web application built to simplify hostel meal management, monitor food inventory, and track attendance. Developed with love by TrioLogic during a hackathon.

🚀 Project Overview
The Hostel Food Management System streamlines daily hostel food operations. It provides a centralized dashboard for admins, supervisors, and students to manage meals, track inventory, and ensure nothing goes to waste.

🧑‍💻 Team: TrioLogic
👨‍💼 NITHIN. K – Team Lead & Backend Developer

🧠 Raghul N.S – UI/UX & Integration

🧰 Thibish D – Firebase & Functional Modules

📦 Features

🛠 Admin Dashboard

View total students, today's attendance, and inventory status

Manage students and kitchen staff

Set daily/weekly menu and meal schedules

Generate basic reports


🍳 Kitchen Supervisor Dashboard

Track daily student attendance

Monitor ingredient stock and reorder when needed

Notify students about meal updates

Assign roles and tasks to kitchen staff


🧑‍🎓 Student Portal

Register meal preferences

Receive real-time updates about meals

Submit feedback about food quality and service


🍱 Double Attendance System
The system implements a dual attendance mechanism to optimize food preparation and reduce waste:

Willingness Marking:
Students must indicate their intent to have a meal at least 4 hours in advance. This helps kitchen staff plan meals more accurately.

Physical Attendance in Mess:
On arriving at the mess, students are required to physically mark their attendance, ensuring that food is served only to those who actually show up.

This two-step process ensures efficient meal planning and minimizes unnecessary food consumption.



⚙️ Tech Stack

Frontend: React, Tailwind CSS, Vite

Backend: Node.js, Express

Database & Auth: Firebase Firestore, Firebase Auth


🧾 Codebase Languages

Breakdown:

🟦 TypeScript: 95.1%

🟨 JavaScript: 4.7%

⚙️ Other: 0.2%


🔧 Setup & Installation
Clone the Repo

bash
Copy
Edit
git clone https://github.com/NITHIN4747/hostel-food-management.git
cd hostel-food-management
Install Dependencies

bash
Copy
Edit
npm install
Set Environment Variables Create a .env file in the root directory and add:

env
Copy
Edit
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Start the Dev Server

bash
Copy
Edit
npm run dev



🔮 Future Enhancements
AI-powered meal forecasting based on attendance

Mobile application support

Integration with hostel payment system




