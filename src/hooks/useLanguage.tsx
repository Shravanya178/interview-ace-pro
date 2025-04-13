import React, { createContext, useContext, useState, useEffect } from "react";

interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
  languages: Language[];
}

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "mr", name: "मराठी (Marathi)" },
];

const translations = {
  en: {
    dashboard: "Dashboard",
    resume_analysis: "Resume Analysis",
    interview_prep: "Interview Preparation",
    mock_tests: "Mock Tests",
    reports: "Reports",
    profile: "Profile",
    logout: "Logout",
    upload_resume: "Upload Resume",
    start_interview: "Start Interview",
    customize_interview: "Customize Your Interview",
    select_company: "Select Company",
    select_role: "Select Role",
    target_company: "Target Company",
    job_role: "Job Role",
    start_test: "Start Test",
    skill_assessment: "Skills Assessment",
    performance: "Performance",
    progress: "Progress",
    recommendations: "Recommendations",
    no_data: "No data available",
    technical_skills: "Technical Skills",
    soft_skills: "Soft Skills",
    search: "Search",
    edit_profile: "Edit Profile",
    save: "Save",
    cancel: "Cancel",
    // Interview types with proper capitalization
    technical_interview: "Technical Interview",
    behavioral_interview: "Behavioral Interview",
    system_design: "System Design",
    full_mock_interview: "Full Mock Interview",
    // Interview Session translations
    "Back to Interview": "Back to Interview",
    "Mock Interview": "Mock Interview",
    "General Interview": "General Interview",
    "Interview Controls": "Interview Controls",
    "Toggle Audio": "Toggle Audio",
    "Toggle Video": "Toggle Video",
    Settings: "Settings",
    "End Interview": "End Interview",
    "Interview Info": "Interview Info",
    Room: "Room",
    Type: "Type",
    Status: "Status",
    Connected: "Connected",
    Connecting: "Connecting",
    error: "Error",
    success: "Success",
    failed_to_initialize_interview: "Failed to initialize interview session",
    interview_session_started: "Interview session started",
    participant_joined: "Participant Joined",
    has_joined_the_session: "has joined the session",
    // Add more translations as needed
    progress_over_time: "Progress Over Time",
    interview_skills_progress: "Your Interview Skills Progress",
    candidate_report: "Candidate Report",
    Technical_interview: "Technical Interview",
    Behavioral_interview: "Behavioral Interview",
    System_design: "System Design",
    Full_mock_interview: "Full Mock Interview",
    // Reports page capitalized terms
    Progress: "Progress",
    Candidate_report: "Candidate Report",
    Recommendations: "Recommendations", 
    Progress_over_time: "Progress Over Time",
    Interview_skills_progress: "Your Interview Skills Progress",
    Priority: "Priority",
    performance_reports: "Performance Reports",
    Performance_reports: "Performance Reports",
    track_progress: "Track Your Progress",
    Track_progress: "Track Your Progress",
    learning_resources: "Learning Resources",
    Learning_resources: "Learning Resources",
    recommended_resources: "Recommended Resources",
    Recommended_resources: "Recommended Resources",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    resume_analysis: "रिज्यूमे विश्लेषण",
    interview_prep: "इंटरव्यू की तैयारी",
    mock_tests: "मॉक टेस्ट",
    reports: "रिपोर्ट",
    profile: "प्रोफ़ाइल",
    logout: "लॉग आउट",
    upload_resume: "रिज्यूमे अपलोड करें",
    start_interview: "इंटरव्यू शुरू करें",
    customize_interview: "अपने इंटरव्यू को अनुकूलित करें",
    select_company: "कंपनी चुनें",
    select_role: "भूमिका चुनें",
    target_company: "लक्षित कंपनी",
    job_role: "कार्य भूमिका",
    start_test: "टेस्ट शुरू करें",
    skill_assessment: "कौशल मूल्यांकन",
    performance: "प्रदर्शन",
    progress: "प्रगति",
    recommendations: "सिफारिशें",
    no_data: "कोई डेटा उपलब्ध नहीं है",
    technical_skills: "तकनीकी कौशल",
    soft_skills: "सॉफ्ट स्किल्स",
    search: "खोज",
    edit_profile: "प्रोफ़ाइल संपादित करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    // Interview types with proper capitalization
    technical_interview: "तकनीकी इंटरव्यू",
    behavioral_interview: "व्यवहारिक इंटरव्यू",
    system_design: "सिस्टम डिज़ाइन",
    full_mock_interview: "पूर्ण मॉक इंटरव्यू",
    // Interview Session translations
    "Back to Interview": "इंटरव्यू पर वापस जाएं",
    "Mock Interview": "मॉक इंटरव्यू",
    "General Interview": "सामान्य इंटरव्यू",
    "Interview Controls": "इंटरव्यू नियंत्रण",
    "Toggle Audio": "ऑडियो टॉगल करें",
    "Toggle Video": "वीडियो टॉगल करें",
    Settings: "सेटिंग्स",
    "End Interview": "इंटरव्यू समाप्त करें",
    "Interview Info": "इंटरव्यू जानकारी",
    Room: "रूम",
    Type: "प्रकार",
    Status: "स्थिति",
    Connected: "कनेक्टेड",
    Connecting: "कनेक्ट हो रहा है",
    error: "त्रुटि",
    success: "सफल",
    failed_to_initialize_interview: "इंटरव्यू सत्र प्रारंभ करने में विफल",
    interview_session_started: "इंटरव्यू सत्र शुरू हो गया है",
    participant_joined: "प्रतिभागी शामिल हुए",
    has_joined_the_session: "सत्र में शामिल हो गए हैं",
    // Report page translations
    progress_over_time: "समय के साथ प्रगति",
    interview_skills_progress: "आपकी इंटरव्यू कौशल प्रगति",
    candidate_report: "उम्मीदवार रिपोर्ट",
    Technical_interview: "तकनीकी इंटरव्यू",
    Behavioral_interview: "व्यवहारिक इंटरव्यू",
    System_design: "सिस्टम डिज़ाइन",
    Full_mock_interview: "पूर्ण मॉक इंटरव्यू",
    Progress: "प्रगति",
    Candidate_report: "उम्मीदवार रिपोर्ट",
    Recommendations: "सिफारिशें",
    Progress_over_time: "समय के साथ प्रगति",
    Interview_skills_progress: "आपकी इंटरव्यू कौशल प्रगति",
    Priority: "प्राथमिकता",
    performance_reports: "प्रदर्शन रिपोर्ट",
    Performance_reports: "प्रदर्शन रिपोर्ट",
    track_progress: "अपनी प्रगति पर नज़र रखें",
    Track_progress: "अपनी प्रगति पर नज़र रखें",
    learning_resources: "सीखने के संसाधन",
    Learning_resources: "सीखने के संसाधन",
    recommended_resources: "अनुशंसित संसाधन",
    Recommended_resources: "अनुशंसित संसाधन",
    // Settings page
    settings: "सेटिंग्स",
    settings_desc: "अपनी पसंद और सेटिंग्स प्रबंधित करें",
    language_preferences: "भाषा पसंद",
    language_preferences_desc: "अपनी पसंद की भाषा चुनें",
    select_language: "भाषा चुनें",
    notification_preferences: "सूचना पसंद",
    notification_preferences_desc: "अपनी सूचना सेटिंग्स प्रबंधित करें",
    email_notifications: "ईमेल सूचनाएं",
    email_notifications_desc: "ईमेल के माध्यम से अपडेट प्राप्त करें",
    browser_notifications: "ब्राउज़र सूचनाएं",
    browser_notifications_desc: "वेब ब्राउज़र में सूचनाएं प्राप्त करें",
    privacy_settings: "गोपनीयता सेटिंग्स",
    privacy_settings_desc: "अपनी गोपनीयता और डेटा सेटिंग्स प्रबंधित करें",
    data_collection: "डेटा संग्रह",
    data_collection_desc: "हम आपका उपयोग डेटा एकत्र कर सकते हैं",
    analytics_tracking: "एनालिटिक्स ट्रैकिंग",
    analytics_tracking_desc: "आपके उपयोग का विश्लेषण करने की अनुमति दें",
    // Additional common terms
    language: "भाषा",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    resume_analysis: "रिझ्यूम विश्लेषण",
    interview_prep: "मुलाखतीची तयारी",
    mock_tests: "मॉक टेस्ट",
    reports: "अहवाल",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",
    upload_resume: "रिझ्यूम अपलोड करा",
    start_interview: "मुलाखत सुरू करा",
    customize_interview: "आपली मुलाखत सानुकूलित करा",
    select_company: "कंपनी निवडा",
    select_role: "भूमिका निवडा",
    target_company: "लक्ष्य कंपनी",
    job_role: "नोकरीची भूमिका",
    start_test: "चाचणी सुरू करा",
    skill_assessment: "कौशल्य मूल्यांकन",
    performance: "कामगिरी",
    progress: "प्रगती",
    recommendations: "शिफारसी",
    no_data: "कोणताही डेटा उपलब्ध नाही",
    technical_skills: "तांत्रिक कौशल्ये",
    soft_skills: "सॉफ्ट स्किल्स",
    search: "शोध",
    edit_profile: "प्रोफाइल संपादित करा",
    save: "जतन करा",
    cancel: "रद्द करा",
    // Interview types with proper capitalization
    technical_interview: "तांत्रिक मुलाखत",
    behavioral_interview: "वर्तणूक मुलाखत",
    system_design: "सिस्टम डिझाइन",
    full_mock_interview: "पूर्ण मॉक मुलाखत",
    // Interview Session translations
    "Back to Interview": "मुलाखतीकडे परत जा",
    "Mock Interview": "मॉक मुलाखत",
    "General Interview": "सामान्य मुलाखत",
    "Interview Controls": "मुलाखत नियंत्रणे",
    "Toggle Audio": "ऑडिओ टॉगल करा",
    "Toggle Video": "व्हिडिओ टॉगल करा",
    Settings: "सेटिंग्ज",
    "End Interview": "मुलाखत संपवा",
    "Interview Info": "मुलाखत माहिती",
    Room: "रूम",
    Type: "प्रकार",
    Status: "स्थिती",
    Connected: "कनेक्टेड",
    Connecting: "कनेक्ट होत आहे",
    error: "त्रुटी",
    success: "यशस्वी",
    failed_to_initialize_interview: "मुलाखत सत्र आरंभ करण्यात अयशस्वी",
    interview_session_started: "मुलाखत सत्र सुरू झाले",
    participant_joined: "सहभागी सामील झाले",
    has_joined_the_session: "सत्रात सामील झाले आहेत",
    // Report page translations
    progress_over_time: "कालांतराने प्रगती",
    interview_skills_progress: "तुमच्या मुलाखत कौशल्यांची प्रगती",
    candidate_report: "उमेदवार अहवाल",
    Technical_interview: "तांत्रिक मुलाखत",
    Behavioral_interview: "वर्तणूक मुलाखत",
    System_design: "सिस्टम डिझाइन",
    Full_mock_interview: "पूर्ण मॉक मुलाखत",
    Progress: "प्रगती",
    Candidate_report: "उमेदवार अहवाल",
    Recommendations: "शिफारसी", 
    Progress_over_time: "कालांतराने प्रगती",
    Interview_skills_progress: "तुमच्या मुलाखत कौशल्यांची प्रगती",
    Priority: "प्राधान्य",
    performance_reports: "कामगिरी अहवाल",
    Performance_reports: "कामगिरी अहवाल",
    track_progress: "आपली प्रगती ट्रॅक करा",
    Track_progress: "आपली प्रगती ट्रॅक करा",
    learning_resources: "शिक्षण संसाधने",
    Learning_resources: "शिक्षण संसाधने",
    recommended_resources: "शिफारस केलेली संसाधने",
    Recommended_resources: "शिफारस केलेली संसाधने",
    // Settings page
    settings: "सेटिंग्ज",
    settings_desc: "आपली प्राधान्ये आणि सेटिंग्ज व्यवस्थापित करा",
    language_preferences: "भाषा प्राधान्ये",
    language_preferences_desc: "आपली पसंतीची भाषा निवडा",
    select_language: "भाषा निवडा",
    notification_preferences: "सूचना प्राधान्ये",
    notification_preferences_desc: "आपल्या सूचना सेटिंग्ज व्यवस्थापित करा",
    email_notifications: "ईमेल सूचना",
    email_notifications_desc: "ईमेलद्वारे अपडेट्स प्राप्त करा",
    browser_notifications: "ब्राउझर सूचना",
    browser_notifications_desc: "वेब ब्राउझरमध्ये सूचना प्राप्त करा",
    privacy_settings: "गोपनीयता सेटिंग्ज",
    privacy_settings_desc: "आपली गोपनीयता आणि डेटा सेटिंग्ज व्यवस्थापित करा",
    data_collection: "डेटा संकलन",
    data_collection_desc: "आम्ही तुमचा वापर डेटा गोळा करू शकतो",
    analytics_tracking: "अँनालिटिक्स ट्रॅकिंग",
    analytics_tracking_desc: "तुमच्या वापराचे विश्लेषण करण्यास परवानगी द्या",
    // Additional common terms
    language: "भाषा",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<string>(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (code: string) => {
    setLanguageState(code);
  };

  const t = (key: string): string => {
    const currentTranslations =
      translations[language as keyof typeof translations] || translations.en;
    
    // First try to get the translation in the current language
    const translation = currentTranslations[key as keyof typeof currentTranslations];
    
    if (translation) {
      return translation;
    }
    
    // If no translation found in current language and it's not English,
    // try to get the English translation as fallback
    if (language !== 'en') {
      const englishTranslation = translations.en[key as keyof typeof translations.en];
      if (englishTranslation) {
        return englishTranslation;
      }
    }
    
    // If no translation found in any language, return the key itself
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
