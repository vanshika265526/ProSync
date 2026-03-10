# PEP Tool - Project Execution & Planning

A comprehensive, full-stack project management application designed to streamline execution and planning. Built with the MERN stack (MongoDB, Express, React, Node.js), this tool offers real-time features, secure authentication, and a sleek user interface for efficient team collaboration.

## 🚀 Features

- **Project Management**: Create, view, and manage multiple projects seamlessly.
- **Task & Subtask System**: Breakdown projects into tasks and further into granular subtasks for better tracking.
- **Secure Authentication**: Traditional Email/Password signup/login along with **Google OAuth** integration.
- **Persistent Notes**: User-specific notes that are saved and synchronized in real-time.
- **Onboarding Flow**: Smooth introduction for new users to get started quickly.
- **Documentation System**: Integrated documentation for both landing and dashboard views.
- **Support & Contact**: Dedicated support interface with email notifications for user inquiries.
- **Modern UI/UX**: Built with React 19, Vite, Tailwind CSS, and Framer Motion for smooth animations and responsiveness.

---

## 🏗️ Project Structure

```text
pep-tool/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # State management (DashboardContext)
│   │   ├── pages/         # Application pages (Home, Auth, Profile, etc.)
│   │   ├── services/      # API communication logic
│   │   └── App.jsx        # Main routing and app structure
│   └── package.json
└── server/                # Node.js & Express Backend
    ├── config/            # Database connection configuration
    ├── controllers/       # Business logic for routes
    ├── middleware/        # Authentication and error handling middlewares
    ├── models/            # Mongoose schemas (User, Project, Task, Note)
    ├── routes/            # API endpoints
    ├── server.js          # Entry point for the server
    └── package.json
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite**
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **React Router Dom** (Routing)
- **Axios** (API Requests)
- **Google OAuth** (@react-oauth/google)

### Backend
- **Node.js** & **Express 5**
- **MongoDB** & **Mongoose** (Database)
- **JSON Web Token (JWT)** (Authentication)
- **Bcryptjs** (Password Hashing)
- **Nodemailer** (Email Notifications)

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Running locally or MongoDB Atlas)
- Google Cloud Console Project (for Google OAuth)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd pep-tool
```

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/Tool
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development

   # SMTP Configuration (Example using Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - Get all projects for logged-in user
- `POST /api/tasks` - Create a new task
- `GET /api/notes` - Fetch user notes

---

## 📄 License
This project is licensed under the ISC License.
