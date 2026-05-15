# AI Study Assistant

A full-stack AI-powered SaaS application for students to summarize notes and chat with their study materials using Gemini AI.

## Tech Stack
- **Backend**: Django, Django REST Framework, JWT, PostgreSQL/SQLite.
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **AI**: Google Gemini API.

## Features
- **JWT Authentication**: Secure login and registration.
- **Note Upload**: Support for PDF and TXT files with automatic text extraction.
- **AI Summaries**: Detailed summaries, key points, and study questions.
- **AI Chatbot**: Context-aware chat restricted to uploaded note content.
- **Modern UI**: Responsive, premium SaaS design with smooth animations.

## Setup Instructions

### Backend
1. Navigate to `backend/` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file (see `.env.example` or use the one provided):
   ```env
   SECRET_KEY=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend
1. Navigate to `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Backend (Render/Heroku)
- Set environment variables on the platform.
- Use a PostgreSQL database (e.g., Neon).
- Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.

### Frontend (Vercel/Netlify)
- Build the project: `npm run build`.
- Update the API base URL in `src/services/api.js` to point to your production backend.

## License
MIT
