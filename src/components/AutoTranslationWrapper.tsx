import React, { ReactNode } from 'react';
import TranslateProvider from './TranslateProvider';
import { useLanguage } from '@/hooks/useLanguage';

interface AutoTranslationWrapperProps {
  children: ReactNode;
  enabled?: boolean;
  className?: string;
}

/**
 * A component that wraps content with auto-translation functionality
 * 
 * This component allows you to optionally enable/disable auto-translation
 * for specific sections of your application.
 * 
 * Usage:
 * <AutoTranslationWrapper>
 *   <p>This text will be automatically translated.</p>
 * </AutoTranslationWrapper>
 * 
 * With disabled translation:
 * <AutoTranslationWrapper enabled={false}>
 *   <p>This text will NOT be translated.</p>
 * </AutoTranslationWrapper>
 */
const AutoTranslationWrapper: React.FC<AutoTranslationWrapperProps> = ({
  children,
  enabled = true,
  className = '',
}) => {
  const { language } = useLanguage();
  
  // If translation is disabled or language is English, just render children as is
  if (!enabled || language === 'en') {
    return <div className={className}>{children}</div>;
  }
  
  // Otherwise apply the translation provider
  return (
    <div className={`translation-wrapper ${className} ${language !== 'en' ? 'translation-active' : ''}`}>
      <TranslateProvider>
        {children}
      </TranslateProvider>
    </div>
  );
};

export default AutoTranslationWrapper; 