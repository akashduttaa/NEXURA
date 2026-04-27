# NEXURA — AI + Blockchain Autonomous Academic Operating System

A visually stunning, full-stack web platform for academic scheduling and student lifecycle management, powered by AI optimization and blockchain-backed data integrity.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Tech Stack](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Tech Stack](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![Tech Stack](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb)
![Tech Stack](https://img.shields.io/badge/Three.js-3D-000000?style=flat-square&logo=three.js)

## ✨ Features

- 🧠 **AI Timetable Generator** — Genetic Algorithm with 300 generations × 60 population
- 🔗 **Blockchain Records** — SHA-256 hash-chained immutable academic ledger
- 📊 **Real-time Analytics** — Faculty workload, room utilization, conflict analysis
- 🎨 **Stunning UI** — 3D particles, glassmorphism, neon glow, Framer Motion animations
- 📱 **Fully Responsive** — Mobile, tablet, and desktop optimized

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (optional — runs with in-memory data if unavailable)

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
```
Server starts on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```
Frontend starts on `http://localhost:3000`

### 3. Demo Flow
1. Visit `http://localhost:3000`
2. Explore the **Landing Page** with 3D particle background
3. Go to **Dashboard** → Switch between Admin/Student/Faculty views
4. Go to **Timetable** → Click **"Generate Timetable"** → See AI-generated schedule
5. Click **"Simulate Change"** → Mark faculty unavailable → **Regenerate**
6. Visit **Blockchain** → View transaction history → Click **"Add Record"**
7. Check **Analytics** → Faculty workload charts, room utilization

## 📁 Project Structure

```
Nexura/
├── client/          # React + Vite Frontend
│   ├── src/
│   │   ├── components/   # UI, 3D, layout components
│   │   ├── pages/        # 5 main pages
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # API client
│   └── ...
├── server/          # Express Backend
│   ├── models/      # Mongoose schemas
│   ├── routes/      # REST API endpoints
│   ├── services/    # GA engine, blockchain simulator
│   └── seed/        # Demo dataset
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/timetable/generate` | Generate timetable via GA |
| POST | `/api/timetable/simulate-change` | Regenerate with constraints |
| GET | `/api/students` | List all students |
| GET | `/api/faculty` | List all faculty |
| GET | `/api/courses` | List all courses |
| GET | `/api/transactions` | Get blockchain chain |
| POST | `/api/transactions` | Add blockchain record |
| GET | `/api/analytics` | Get analytics data |

## 🎨 Tech Stack

**Frontend:** React 18, Vite 6, Tailwind CSS 4, Framer Motion, Three.js / React Three Fiber, Recharts, React Router v7

**Backend:** Node.js 20, Express 4, Mongoose / MongoDB

**AI:** Custom Genetic Algorithm (population 60, 300 generations, tournament selection, uniform crossover, adaptive mutation)

**Blockchain:** Simulated SHA-256 hash chain with proof-of-work (difficulty 2)
