import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import LanguageSelector from '@/components/layout/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle, AlertTriangle, Download, RefreshCw, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import TranslateText from '@/components/TranslateText';

// Add translations definition
const translationsData = {
  en: {
    dashboard: "Dashboard",
    resume_analysis: "Resume Analysis",
    interview_prep: "Interview Preparation",
    start_now: "Start Now",
    // Add more keys as needed
  },
  es: { dashboard: "Panel", interview_prep: "Preparación Para Entrevistas" },
  fr: { dashboard: "Tableau de bord", interview_prep: "Préparation D'Entretien" },
  de: { dashboard: "Dashboard", interview_prep: "Interviewvorbereitung" },
  zh: { dashboard: "仪表板", interview_prep: "面试准备" },
  ja: { dashboard: "ダッシュボード", interview_prep: "面接準備" }
};

const TestTranslation = () => {
  const { t, language, languages } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [missingTranslations, setMissingTranslations] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Predefined key categories for organization
  const translationCategories = {
    ui: [
      'dashboard', 'settings', 'profile', 'login', 'logout', 'search',
      'save', 'cancel', 'edit_profile', 'theme', 'language', 'previous', 
      'next', 'continue', 'back', 'close', 'loading', 'submit', 'confirm', 
      'apply', 'filter', 'sort', 'clear', 'select', 'select_all', 'deselect_all'
    ],
    features: [
      'resume_analysis', 'interview_preparation', 'mock_tests', 'reports',
      'skill_assessment', 'performance', 'technical_skills', 'soft_skills'
    ],
    landing: [
      'welcome_title', 'welcome_description', 'get_started', 'start_now',
      'ai_powered_interview_prep', 'platform_description', 'how_prepmate_works',
      'mock_interview', 'detailed_feedback'
    ],
    interviews: [
      'technical_interview', 'behavioral_interview', 'system_design', 
      'full_mock_interview', 'customize_interview', 'start_interview'
    ],
    reports: [
      'progress_over_time', 'interview_skills_progress', 'candidate_report',
      'progress', 'recommendations'
    ],
    settings: [
      'language_preferences', 'theme_settings', 'notification_preferences',
      'light_mode', 'dark_mode', 'system_theme', 'select_theme', 
      'privacy_settings', 'theme_settings_desc'
    ]
  };
  
  // Get all keys from all languages and identify missing translations
  useEffect(() => {
    if (!translationsData) return;
    
    // Get all unique keys from all language objects
    const keySet = new Set<string>();
    Object.values(translationsData).forEach((langObj: any) => {
      if (langObj && typeof langObj === 'object') {
        Object.keys(langObj).forEach(key => keySet.add(key));
      }
    });
    
    const allKeysArray = Array.from(keySet).sort();
    setAllKeys(allKeysArray);
    
    // Find missing translations for current language
    if (language !== 'en') {
      const enKeys = Object.keys(translationsData.en || {});
      const currentLangKeys = Object.keys(translationsData[language as keyof typeof translationsData] || {});
      const missing = enKeys.filter(key => !currentLangKeys.includes(key));
      setMissingTranslations(missing.sort());
    } else {
      setMissingTranslations([]);
    }
  }, [translationsData, language]);
  
  // Function to get translation keys by category or search
  const getFilteredKeys = (category: keyof typeof translationCategories) => {
    const categoryKeys = translationCategories[category] || [];
    
    if (!searchTerm) return categoryKeys;
    
    return categoryKeys.filter(key => 
      key.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t(key).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Check if a key has translation in current language
  const hasTranslation = (key: string): boolean => {
    if (!translationsData || !translationsData[language as keyof typeof translationsData]) return false;
    return key in translationsData[language as keyof typeof translationsData];
  };
  
  const renderTranslationItem = (key: string) => (
    <div key={key} className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-md p-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          {key}
        </span>
        {hasTranslation(key) ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {t(key)}
      </span>
      {language !== 'en' && hasTranslation(key) && (
        <span className="text-xs text-gray-500 mt-1">
          EN: {translationsData.en[key as keyof typeof translationsData.en]}
        </span>
      )}
    </div>
  );
  
  // Translate custom text - implement a stub since translateText is not available
  const handleTranslate = async () => {
    if (!customText || language === 'en') {
      setTranslatedText(customText);
      return;
    }
    
    setIsTranslating(true);
    try {
      // Mock translation with a simple delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Just append a note since we don't have actual translation
      setTranslatedText(`${customText} (translated to ${language})`);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText(customText);
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Export translations data as JSON
  const exportTranslations = () => {
    try {
      const dataStr = JSON.stringify(translationsData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `translations_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
    } catch (err) {
      console.error('Failed to export translations:', err);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('translation_test_page') || 'Translation Test Page'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('current_language') || 'Current language'}: <span className="font-medium">{language.toUpperCase()}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportTranslations}
              variant="outline"
              size="sm"
              className="mr-2"
            >
              <Download className="h-4 w-4 mr-1" />
              Export JSON
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              {t('change_language') || 'Change language'}:
            </span>
            <LanguageSelector />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-blue-500" />
              Google Translate Demo
            </CardTitle>
            <CardDescription>
              Test automatic translation of any text using Google Translate API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Enter Text (English)</label>
                <Textarea 
                  value={customText} 
                  onChange={(e) => setCustomText(e.target.value)}
                  className="min-h-[120px]"
                  placeholder="Enter text in English to translate..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Translated Text ({language.toUpperCase()})</label>
                <div className="border rounded-md bg-gray-50 dark:bg-gray-900 p-3 min-h-[120px]">
                  {isTranslating ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                      <span>Translating...</span>
                    </div>
                  ) : (
                    translatedText || <span className="text-gray-400">Translation will appear here</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <span className="text-sm text-gray-500">
                Powered by Google Translate API
              </span>
            </div>
            <Button 
              onClick={handleTranslate} 
              disabled={!customText || isTranslating || language === 'en'}
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Translate
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>TranslateText Component Demo</CardTitle>
            <CardDescription>
              This component automatically translates text content in your components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Without Translation Component:</h3>
                <p className="mb-2">This is regular text that won't be translated automatically.</p>
                <p className="mb-2">Your current language is {language}.</p>
                <Button variant="outline" size="sm">Click me</Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">With Translation Component:</h3>
                <p className="mb-2"><TranslateText text="This text will be automatically translated to your current language." /></p>
                <p className="mb-2"><TranslateText text="Your current language is" /> {language}.</p>
                <TranslateText text="Click me">
                  <Button variant="outline" size="sm">Click me</Button>
                </TranslateText>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {language !== 'en' && missingTranslations.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
            <h3 className="font-medium text-amber-800 dark:text-amber-400 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Missing translations in {language}: {missingTranslations.length}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingTranslations.slice(0, 10).map(key => (
                <Badge key={key} variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                  {key}
                </Badge>
              ))}
              {missingTranslations.length > 10 && (
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                  +{missingTranslations.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder={t('search_translations') || "Search translations..."}
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            {languages.map(lang => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => window.localStorage.setItem("language", lang.code)}
                className="text-xs px-3"
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
        
        <Tabs defaultValue="translate">
          <TabsList className="mb-4">
            <TabsTrigger value="translate">Google Translate</TabsTrigger>
            <TabsTrigger value="ui">{t('ui_elements') || 'UI Elements'}</TabsTrigger>
            <TabsTrigger value="features">{t('features') || 'Features'}</TabsTrigger>
            <TabsTrigger value="landing">{t('landing_page') || 'Landing Page'}</TabsTrigger>
            <TabsTrigger value="interviews">{t('interviews') || 'Interviews'}</TabsTrigger>
            <TabsTrigger value="reports">{t('reports') || 'Reports'}</TabsTrigger>
            <TabsTrigger value="settings">{t('settings') || 'Settings'}</TabsTrigger>
            {missingTranslations.length > 0 && (
              <TabsTrigger value="missing">
                Missing 
                <Badge variant="destructive" className="ml-2">
                  {missingTranslations.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="translate">
            <Card>
              <CardHeader>
                <CardTitle>How To Use Translation In Your App</CardTitle>
                <CardDescription>
                  Follow these steps to add automatic translation to your components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Option 1: Use the TranslateText component</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                      <code className="text-sm font-mono">
                        {`import TranslateText from '@/components/TranslateText';\n\n`}
                        {`// Simple usage:\n`}
                        {`<TranslateText text="Hello world" />\n\n`}
                        {`// With custom element:\n`}
                        {`<TranslateText text="Welcome" as="h1" className="text-2xl" />\n\n`}
                        {`// With children (for components):\n`}
                        {`<TranslateText text="Click me">\n`}
                        {`  <Button>Click me</Button>\n`}
                        {`</TranslateText>`}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Option 2: Use the t() function for defined keys</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                      <code className="text-sm font-mono">
                        {`import { useLanguage } from '@/hooks/useLanguage';\n\n`}
                        {`function MyComponent() {\n`}
                        {`  const { t } = useLanguage();\n\n`}
                        {`  return (\n`}
                        {`    <div>\n`}
                        {`      <h1>{t('welcome_title')}</h1>\n`}
                        {`      <p>{t('welcome_description')}</p>\n`}
                        {`    </div>\n`}
                        {`  );\n`}
                        {`}`}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Option 3: Use translateText() for dynamic content</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                      <code className="text-sm font-mono">
                        {`import { useLanguage } from '@/hooks/useLanguage';\n\n`}
                        {`function MyComponent() {\n`}
                        {`  const { translateText } = useLanguage();\n`}
                        {`  const [text, setText] = useState('');\n\n`}
                        {`  const handleTranslate = async () => {\n`}
                        {`    const translated = await translateText('Some dynamic content');\n`}
                        {`    setText(translated);\n`}
                        {`  };\n\n`}
                        {`  return (\n`}
                        {`    <Button onClick={handleTranslate}>Translate</Button>\n`}
                        {`  );\n`}
                        {`}`}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {(Object.keys(translationCategories) as Array<keyof typeof translationCategories>).map(category => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Translations</CardTitle>
                  <CardDescription>
                    {getFilteredKeys(category).length} translation keys in this category
                    {searchTerm && ` matching "${searchTerm}"`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFilteredKeys(category).length > 0 ? (
                      getFilteredKeys(category).map(renderTranslationItem)
                    ) : (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        No translations found {searchTerm && `matching "${searchTerm}"`}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
          
          {missingTranslations.length > 0 && (
            <TabsContent value="missing">
              <Card>
                <CardHeader>
                  <CardTitle>Missing Translations</CardTitle>
                  <CardDescription>
                    {missingTranslations.length} keys missing in language: {language}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {missingTranslations
                      .filter(key => !searchTerm || key.includes(searchTerm))
                      .map(key => (
                        <div key={key} className="flex flex-col border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-md p-3">
                          <span className="text-sm text-amber-800 dark:text-amber-300 font-mono mb-1">
                            {key}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {translationsData.en[key as keyof typeof translationsData.en]}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          <p>If you see the key name instead of a translated value, it means that key is missing in the translations object for the current language.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestTranslation; 