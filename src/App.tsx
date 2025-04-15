import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import InterviewPrep from "./pages/InterviewPrep";
import InterviewSession from "./pages/InterviewSession";
import AIInterviewSimulator from "./pages/AIInterviewSimulator";
import InterviewPage from "./pages/InterviewPage";
import MockTest from "./pages/MockTest";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import FacialEmotionAnalysis from "./pages/FacialEmotionAnalysis";
import TestTranslation from "./pages/TestTranslation";
import AuthCallback from "./pages/auth/callback";
import React from "react";
import Index from "./pages/Index";
import Test from "./pages/Test";

const queryClient = new QueryClient();

// Temporary function to provide direct access without authentication
const DirectAccess = ({ element }: { element: React.ReactElement }) => {
  return element;
};

const App = () => {
  // Initialize language from localStorage
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      document.documentElement.lang = savedLanguage;
    }
    
    // Add debugging message to console
    console.log("App mounted, initializing with React", React.version);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/test-page" element={<Index />} />
                  <Route path="/basic-test" element={<Test />} />
                  <Route
                    path="/dashboard"
                    element={<DirectAccess element={<Dashboard />} />}
                  />
                  <Route
                    path="/resume"
                    element={<DirectAccess element={<ResumeAnalysis />} />}
                  />
                  <Route
                    path="/interview"
                    element={<DirectAccess element={<InterviewPrep />} />}
                  />
                  <Route
                    path="/interview-session"
                    element={
                      <DirectAccess
                        element={<InterviewSession roomName="prepmate" />}
                      />
                    }
                  />
                  <Route
                    path="/ai-interview-simulator"
                    element={<DirectAccess element={<AIInterviewSimulator />} />}
                  />
                  <Route
                    path="/interview-simple"
                    element={<DirectAccess element={<InterviewPage />} />}
                  />
                  <Route
                    path="/mock-test"
                    element={<DirectAccess element={<MockTest />} />}
                  />
                  <Route
                    path="/reports"
                    element={<DirectAccess element={<Reports />} />}
                  />
                  <Route
                    path="/profile"
                    element={<DirectAccess element={<Profile />} />}
                  />
                  <Route
                    path="/settings"
                    element={<DirectAccess element={<Settings />} />}
                  />
                  <Route
                    path="/facial-emotion-analysis"
                    element={<DirectAccess element={<FacialEmotionAnalysis />} />}
                  />
                  <Route
                    path="/test-translation"
                    element={<DirectAccess element={<TestTranslation />} />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
