# AI Study Assistant

AI Study Assistant is a full-stack study platform that helps students manage notes, generate AI-powered summaries, create quizzes and flashcards, and talk to an AI tutor.

---
## 🌐 Live Demo

**Frontend**: [ai-study-assistant-coral.vercel.app](https://ai-study-assistant-coral.vercel.app)  
**Status**: 🟢 Live and Deployed
---
## What this project does

This app provides:

- A **notes library** for saving, editing, and browsing study material
- **AI summaries** of notes so you can review fast
- **Quiz generation** for active recall practice
- **Flashcard deck creation** for efficient studying
- **AI chat tutoring** for follow-up questions
- **Protected authentication** with JWT login and sessions
- **Responsive UI** for desktop and mobile usage

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, Framer Motion |
| State Management | Zustand, React Query |
| Forms | React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Database | Prisma ORM with SQLite for development |
| AI | OpenAI GPT models |
| Authentication | JWT access + refresh tokens |

---

## Screenshots

Add screenshot images to a `screenshots/` folder and use Markdown like:

```md
![Dashboard](screenshots/dashboard.png)
![Notes](screenshots/notes.png)
![Chat](screenshots/chat.png)
```

---

## Run locally on laptop and mobile

### 1. Open the project

```bash
cd "AI STUDY ASSISTANT"
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your values:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-very-long-random-secret-here"
JWT_REFRESH_SECRET="another-very-long-random-secret"
OPENAI_API_KEY="sk-..."
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Initialize the database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 5. Start the app

**Backend:**

```bash
npm run dev:backend
```

**Frontend:**

```bash
npm run dev:frontend
```

Or run both together:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173). To use a mobile device, open the same local URL from your phone browser on the same network.

### 6. One-step deployment package

If you want to prepare the app for production and push it to GitHub, use the helper script:

```powershell
cd "C:\Users\ksaug\Desktop\AI STUDY ASSISTANT"
.\deploy.ps1 -GitHubRemote "https://github.com/YOUR_USERNAME/ai-study-assistant.git"
```

If Git is not installed, install it first from https://git-scm.com/download/win.

This script:

- checks for Node.js, npm, and Git
- creates `.env` files from examples if needed
- installs dependencies for backend and frontend
- builds both backend and frontend
- initializes Git and makes a first commit

---

---

## Mobile experience

- The dashboard and cards scale down for phone screens.
- Notes and note details are designed to wrap and remain readable.
- Chat includes a mobile-friendly session selector.
- Theme toggle works on all device sizes.

---

## Project structure

```
AI STUDY ASSISTANT/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── package.json
├── README.md
└── .gitignore
```

---

## Deployment

### ⚡ Quick Deploy (Recommended)

For a complete step-by-step deployment guide to Railway (backend) + Vercel (frontend), see [DEPLOYMENT.md](DEPLOYMENT.md).

### Manual Backend deployment

1. Deploy the backend to a host such as Railway, Render, or Fly.io.
2. Set production env vars:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL`
3. Run Prisma deploy:

```bash
npx prisma migrate deploy
```

### Manual Frontend deployment

1. Set `VITE_API_URL` to your deployed backend API URL.
2. Build:

```bash
npm run build --prefix frontend
```

3. Deploy the `frontend/dist` folder to Vercel, Netlify, or another static host.

---

## GitHub deployment notes

- Push the repository to GitHub.
- Use GitHub Pages for frontend-only hosting or connect the repo to Vercel for the full app.
- For a complete live demo, deploy backend and frontend separately and link the frontend to the backend API.

---

## Notes

- The frontend and backend now build successfully.
- Dashboard styling and animations were improved.
- Mobile chat session selection is now available.
- UI components use glassmorphism and smooth animations.
