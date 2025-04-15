**DEPLOYED PROJECT LINK**:

# PrepMate
## What technologies are used for this project?

This project is built with:

🎨 Frontend:

React.js with TypeScript for a strong, component-based UI

Tailwind CSS, Shadcn UI, and Lucide Icons for styling and visual design

React Router for seamless navigation

⚙ Backend & Data:

Supabase as our backend (auth + PostgreSQL + file storage)

Vite for fast builds and dev environment

🤖 AI & Emotion Analysis:

TensorFlow.js for facial expression recognition

Google Gemini API for generating smart interview questions and feedback

Web Speech API for voice input and AI responses


🔄 State Management & Utilities:

React Context API and React Query for efficient state and data management

LocalStorage and i18n for personalization and multilingual support

useToast for notifications

💻 DevOps & Architecture:

Git + GitHub for version control

Component-based architecture with custom hooks for reusable logic

Vercel for Deployment.

## Deployment Instructions

### Deploying to Vercel

1. Fork or clone this repository
2. Connect your GitHub repository to Vercel
3. Configure the following settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add any required environment variables in the Vercel dashboard
5. Deploy the application

The project is configured with the necessary Vercel configuration files, including:
- `vercel.json` - Defines build settings and API routes
- `.env.production` - Contains production environment variables
- `api/index.py` - Serverless API handler

