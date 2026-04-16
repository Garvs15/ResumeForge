# 🚀 ResumeForge — AI-Powered Resume Builder

Create ATS-optimized resumes in minutes with AI-driven insights, real-time suggestions, and role-specific optimization.

---

## ✨ Features

- 🤖 **AI Resume Analyzer**
  - Get instant feedback on your resume
  - AI rewrites bullet points with impact + metrics
  - Highlights strong vs weak sections

- 🎯 **ATS Optimization**
  - Keyword suggestions based on job roles
  - Improves resume ranking for recruiters

- 📄 **Smart Resume Builder**
  - Structured sections (Experience, Projects, Skills)
  - Clean and modern UI

- 🔄 **Live Editing**
  - Real-time updates while editing
  - Seamless user experience

- 🖼️ **Profile Image Upload**
  - Secure storage using Supabase

- ⚡ **Fast & Responsive UI**
  - Built with modern frontend tools

---

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Framer Motion (animations)

### Backend / Services
- Supabase (Auth, Database, Storage)
- AI SDK (LLM integration)

### Testing
- Vitest (unit testing)
- React Testing Library
- Playwright (E2E testing)

---

## 📂 Project Structure
src/
├── app/
├── components/
├── lib/
├── utils/
├── hooks/
├── tests/

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/resumeforge.git
cd resumeforge

2. Install dependencies
npm install
3. Setup environment variables

Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_key

4. Run the development server
npm run dev

App will run on:

http://localhost:3000
🧪 Testing
Run unit tests
npm run test

Run all tests
npm run test:run
Run E2E tests
npx playwright test

🔐 Authentication
Supabase Auth is used for:
User login/signup
Secure profile management

📦 Storage
Supabase Storage used for:
Profile image uploads
Public URL access

🚀 Deployment
Recommended: Vercel
npm run build
npm start

📈 Future Improvements
AI resume scoring system
Resume version comparison
Export to PDF (custom templates)
Job-specific resume tailoring
Collaboration features
🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

📧 Contact

Garv Singla
📩 garvs0041@gmail.com
