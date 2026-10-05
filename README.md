# Data Science Classroom Quiz & Live Multi-Player Leaderboard

A responsive, high-performance web quiz application designed for classroom assessments with **50 Data Science MCQs**, **instant answer feedback**, **comprehensive option-by-option explanations**, and a **real-time shared multi-player leaderboard**.

---

## 🚀 Features

- **50 Curriculum Questions Across 5 Units**:
  - Unit 1: Introduction to Data Science
  - Unit 2: Big Data & Analysis Core Concepts
  - Unit 3: Python Environment & NumPy Fundamentals
  - Unit 4: Data Manipulation with Pandas
  - Unit 5: Data Cleaning & Matplotlib Visualization
- **Instant Answer Feedback**: Immediately see whether your chosen option is correct or incorrect as soon as you select it.
- **Detailed Option-by-Option Explanations**: Deep-dive explanations for all 4 choices (A, B, C, D) for all 50 questions, showing why the correct answer is right and why distractors are wrong.
- **🌐 Shared Classroom Multi-Player Leaderboard**:
  - Perfect for sharing with a WhatsApp / Telegram / Teams classroom group.
  - Students enter their name on opening the Netlify link.
  - As soon as any student completes their quiz, their score, accuracy percentage, and completion time are published to the cloud.
  - Every classmate immediately sees the new player and their updated ranking in real-time!
  - 1-click **"Share Quiz Link"** button to copy and share the classroom link with your group.
  - Real-time Server-Sent Events (SSE) relay and optional Google Firebase Firestore cloud backend.

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Run locally in development mode
npm run dev
# Open http://localhost:5173

# Validate 50 questions and answer key integrity
npm run validate

# Production build
npm run build
```

---

## 🌐 Deploying to Netlify

1. Push this repository to GitHub: `https://github.com/VishnuRam1010/quiz.git`.
2. Go to [Netlify](https://app.netlify.com/) and click **"Add new site" -> "Import an existing project" -> "GitHub"**.
3. Select `VishnuRam1010/quiz`.
4. Netlify will automatically detect:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy site**.
6. Once deployed, open your site and click **"Share Quiz Link"** on the Leaderboard or copy the URL (e.g., `https://your-quiz.netlify.app/?room=datascience-class-2025`).
7. Send the link to your class group. All students' submissions will automatically sync to the shared leaderboard!
