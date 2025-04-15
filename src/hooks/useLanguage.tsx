import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
  languages: { code: string; name: string }[];
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations object
const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    resume_analysis: "Resume Analysis",
    interview_prep: "Interview Preparation",
    start_now: "Start Now",
    ai_powered_interview_prep: "AI-Powered Interview Preparation",
    ace_your_next_tech_interview: "Ace Your Next Tech Interview",
    prepare_for_tech_interviews: "Prepare for your next tech interview with AI-powered practice, real-time feedback, and personalized coaching.",
    go_to_dashboard: "Go to Dashboard",
    mock_interview: "Mock Interview",
    ai_resume_analysis: "AI Resume Analysis",
    skill_assessment: "Skill Assessment",
    mock_interviews: "Mock Interviews",
    mock_tests: "Mock Tests",
    detailed_feedback: "Detailed Feedback",
    switch_to_dark: "Switch to dark theme",
    switch_to_light: "Switch to light theme",
    select_language: "Select Language"
  },
  es: { /* Spanish translations would go here */ dashboard: "Panel", interview_prep: "Preparación Para Entrevistas", mock_tests: "Pruebas Simuladas", switch_to_dark: "Cambiar a tema oscuro", switch_to_light: "Cambiar a tema claro", select_language: "Seleccionar idioma" },
  fr: { /* French translations would go here */ dashboard: "Tableau de bord", interview_prep: "Préparation D'Entretien", mock_tests: "Tests Pratiques", switch_to_dark: "Passer au thème sombre", switch_to_light: "Passer au thème clair", select_language: "Choisir la langue" },
  de: { /* German translations would go here */ dashboard: "Dashboard", interview_prep: "Interviewvorbereitung", mock_tests: "Übungstests", switch_to_dark: "Zum dunklen Design wechseln", switch_to_light: "Zum hellen Design wechseln", select_language: "Sprache auswählen" },
  zh: { /* Chinese translations would go here */ dashboard: "仪表板", interview_prep: "面试准备", mock_tests: "模拟测试", switch_to_dark: "切换到暗色主题", switch_to_light: "切换到亮色主题", select_language: "选择语言" },
  ja: { /* Japanese translations would go here */ dashboard: "ダッシュボード", interview_prep: "面接準備", mock_tests: "模擬テスト", switch_to_dark: "ダークテーマに切り替える", switch_to_light: "ライトテーマに切り替える", select_language: "言語を選択" }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const availableLanguages: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja'];
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ];

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguage') as Language;
    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      setLanguage(savedLanguage);
      return;
    }

    // If no saved preference, try to detect from browser
    const browserLanguage = navigator.language.split('-')[0] as Language;
    if (browserLanguage && availableLanguages.includes(browserLanguage)) {
      setLanguage(browserLanguage);
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('userLanguage', language);
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    availableLanguages,
    languages,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 