# Customer Feedback & Feature Request Portal

A full-stack **MERN** application that gives businesses a centralized platform to collect customer feedback, manage feature requests, and let the community vote on what matters most — with real-time updates, AI-powered sentiment analysis, and a beautiful dark-themed UI.

![Stack](https://img.shields.io/badge/stack-MERN-61dafb) ![Socket.io](https://img.shields.io/badge/realtime-Socket.io-010101) ![Tailwind](https://img.shields.io/badge/UI-Tailwind-38bdf8) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### Core
- 🔐 **JWT Authentication** — register, login, role-based access (user/admin)
- 💬 **Feedback System** — submit, browse, filter, delete; categorized
- 💡 **Feature Requests** — submit, view, edit, delete with status workflow
- 👍 **Voting** — one-user-one-vote, toggle on/off, enforced at DB level
- 🛡️ **Admin Dashboard** — manage everything, update statuses, moderate users

### Advanced
- ⚡ **Real-time Updates** — votes and comments broadcast instantly via Socket.io
- 💭 **Comment System** — discuss feature requests with threaded updates
- 🔍 **Search & Filter** — by category, status, sentiment, or free-text
- 🔥 **Trending Algorithm** — combines vote count with recency (Reddit-style hot score)
- 📧 **Email Notifications** — Nodemailer wiring (optional, no-ops without SMTP)
- 🌓 **Dark Mode** — beautiful dark-first UI with smooth transitions
- 📊 **Analytics Dashboard** — charts via Recharts (pie, bar, line trends)

### AI (Bonus)
- 🧠 **Sentiment Analysis** — every submission auto-scored positive/neutral/negative
- 🏷️ **Auto-Categorization** — NLP-based category suggestions
- 📈 **Popularity Prediction** — heuristic score before submitting a request

---

## 🛠️ Tech Stack

| Layer     | Technology                                                |
|-----------|-----------------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Socket.io-client, Lucide icons, React Hot Toast |
| Backend   | Node.js, Express, MongoDB + Mongoose, JWT, Bcrypt, Socket.io, Helmet, express-rate-limit, express-validator |
| AI/NLP    | `sentiment`, `natural` (tokenizer + keyword classifier)    |
| Email     | Nodemailer (Gmail / SMTP)                                 |

---

## 📁 Project Structure

```
feedback-portal/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── feedbackController.js
│   │   ├── featureRequestController.js
│   │   ├── voteController.js
│   │   ├── commentController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect + adminOnly
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Feedback.js
│   │   ├── FeatureRequest.js
│   │   ├── Vote.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── featureRoutes.js
│   │   ├── voteRoutes.js
│   │   ├── commentRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── aiHelpers.js          # sentiment + auto-categorize + predict
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   └── seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/           # Navbar, FeatureCard, ProtectedRoute, ...
    │   ├── context/              # Auth, Theme, Socket
    │   ├── pages/                # Landing, Login, Register, Dashboard, Features, FeatureDetail, Feedback, AdminDashboard, NotFound
    │   ├── services/             # api.js + services.js
    │   ├── utils/                # helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** (local install or Atlas cluster)
- npm / pnpm / yarn

### 1. Clone & install

```bash
# unzip the project, then:
cd feedback-portal

# Backend
cd backend
npm install
cp .env.example .env
# edit .env and set MONGO_URI + JWT_SECRET

# Frontend (in a new terminal)
cd ../frontend
npm install
cp .env.example .env
```

### 2. Seed the database with demo data

```bash
cd backend
npm run seed
```

This creates:
- **Admin** → `admin@feedback.com` / `Admin@123`
- **User** → `demo@feedback.com` / `Demo@123`
- 5 sample feature requests + 3 feedback entries

### 3. Run the app

```bash
# Terminal 1 — backend (port 5000)
cd backend
npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** and log in with the demo credentials.

---

## 📡 API Routes

### Auth (`/api/auth`)
| Method | Endpoint   | Access  | Description              |
|--------|------------|---------|--------------------------|
| POST   | /register  | Public  | Register a new user      |
| POST   | /login     | Public  | Login & get JWT          |
| GET    | /me        | Private | Get current user profile |

### Feedback (`/api/feedback`)
| Method | Endpoint | Access  | Description            |
|--------|----------|---------|------------------------|
| GET    | /        | Private | List (search / filter) |
| POST   | /        | Private | Create feedback        |
| GET    | /:id     | Private | Get single feedback    |
| DELETE | /:id     | Owner/Admin | Delete             |

### Feature Requests (`/api/features`)
| Method | Endpoint  | Access       | Description                |
|--------|-----------|--------------|----------------------------|
| GET    | /         | Private      | List (search/filter/sort)  |
| POST   | /         | Private      | Create                     |
| GET    | /:id      | Private      | Get single                 |
| PUT    | /:id      | Owner/Admin  | Update (status = admin)    |
| DELETE | /:id      | Owner/Admin  | Delete (cascades votes)    |
| POST   | /predict  | Private      | AI popularity prediction   |

### Votes (`/api/votes`)
| Method | Endpoint      | Access         | Description            |
|--------|---------------|----------------|------------------------|
| POST   | /:requestId   | Private        | Toggle vote            |
| GET    | /:requestId   | Admin          | List voters            |

### Comments (`/api/comments`)
| Method | Endpoint           | Access         | Description      |
|--------|--------------------|----------------|------------------|
| GET    | /:requestId        | Private        | List comments    |
| POST   | /:requestId        | Private        | Post comment     |
| DELETE | /comment/:id       | Owner/Admin    | Delete comment   |

### Admin (`/api/admin`)
| Method | Endpoint             | Access | Description             |
|--------|----------------------|--------|-------------------------|
| GET    | /analytics           | Admin  | Aggregated stats        |
| GET    | /users               | Admin  | List all users          |
| PUT    | /users/:id/role      | Admin  | Promote / demote        |

### Real-time events (Socket.io)
| Event          | Payload                                          |
|----------------|--------------------------------------------------|
| `vote:update`  | `{ requestId, votes, action }`                   |
| `comment:new`  | `{ requestId, comment }`                         |

---

## 🗄️ Database Schemas

**User** — `{ username, email, password (hashed), role, createdAt }`
**Feedback** — `{ title, description, category, sentiment {label, score}, createdBy, createdAt }`
**FeatureRequest** — `{ title, description, category, votes, status, sentiment, createdBy, createdAt }` + `trendingScore` virtual
**Vote** — `{ requestId, userId }` with compound unique index (1 user → 1 vote per request)
**Comment** — `{ requestId, userId, content, createdAt }`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable          | Default                                      | Purpose                     |
|-------------------|----------------------------------------------|-----------------------------|
| `PORT`            | `5000`                                       | Server port                 |
| `NODE_ENV`        | `development`                                | Mode                        |
| `MONGO_URI`       | `mongodb://localhost:27017/feedback_portal`  | Database URI                |
| `JWT_SECRET`      | **change me**                                | Signing key                 |
| `JWT_EXPIRES_IN`  | `7d`                                         | Token TTL                   |
| `CLIENT_URL`      | `http://localhost:5173`                      | CORS origin                 |
| `EMAIL_*`         | optional                                     | Nodemailer SMTP config      |
| `ADMIN_EMAIL`     | `admin@feedback.com`                         | Seed admin email            |
| `ADMIN_PASSWORD`  | `Admin@123`                                  | Seed admin password         |

### Frontend (`frontend/.env`)

| Variable            | Default                    | Purpose                |
|---------------------|----------------------------|------------------------|
| `VITE_API_URL`      | `/api`                     | API base URL (proxied) |
| `VITE_SOCKET_URL`   | `http://localhost:5000`    | Socket.io server URL   |

---

## 🌍 Deployment

### Backend → Render / Railway

1. Push the `backend/` folder to GitHub.
2. Create a new **Web Service** and set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment variables**: copy from `.env.example` (use MongoDB Atlas URI).
3. Set `CLIENT_URL` to your deployed frontend URL.

### Frontend → Vercel / Netlify

1. Push the `frontend/` folder.
2. Set build command to `npm run build` and output directory to `dist`.
3. Set environment variables:
   - `VITE_API_URL=https://<your-backend>.onrender.com/api`
   - `VITE_SOCKET_URL=https://<your-backend>.onrender.com`
4. Deploy.

### MongoDB Atlas
Create a free cluster, whitelist your deployment IP (or `0.0.0.0/0` for public), and copy the connection string into `MONGO_URI`.

---

## 🧪 Demo Credentials

| Role  | Email                 | Password   |
|-------|-----------------------|------------|
| Admin | admin@feedback.com    | Admin@123  |
| User  | demo@feedback.com     | Demo@123   |

---

## 🗺️ Roadmap Ideas

- OAuth (Google / GitHub)
- File attachments on feedback
- Custom tags beyond fixed categories
- Weekly digest email to admins
- In-app notification bell
- Public roadmap page
- Integration with GitHub Issues / Linear / Jira

---

## 📜 License

MIT © Nithin Reddy
