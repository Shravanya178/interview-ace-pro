import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface TranslateTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * Component that automatically translates text content using Google Translate API
 * 
 * Usage:
 * <TranslateText text="Hello world" />
 * 
 * With custom element:
 * <TranslateText text="Welcome" as="h1" className="text-2xl" />
 * 
 * With children (for complex elements):
 * <TranslateText text="Click me">
 *   <Button>Click me</Button>
 * </TranslateText>
 */
const TranslateText: React.FC<TranslateTextProps> = ({ 
  text, 
  className, 
  as: Component = 'span',
  children 
}) => {
  const { language, translateText } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // No need to translate if already in English
    if (language === 'en') {
      setTranslated(text);
      return;
    }

    // Check if we have a cached version first
    const cacheKey = `trans_${language}_${text.substring(0, 50)}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      setTranslated(cached);
      return;
    }

    // Translate the text
    setIsLoading(true);
    translateText(text)
      .then(result => {
        setTranslated(result);
        // Cache the result
        localStorage.setItem(cacheKey, result);
      })
      .catch(() => {
        // On error, just show the original text
        setTranslated(text);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [text, language, translateText]);

  // If children are provided, use them but with translated text where appropriate
  if (children) {
    return React.isValidElement(children) 
      ? React.cloneElement(children as React.ReactElement, {
          // Pass translated text to the child component
          // This works best for simple components like Button that accept children 
          children: translated,
          className: [children.props.className, isLoading ? 'opacity-70' : ''].filter(Boolean).join(' ')
        })
      : <>{children}</>;
  }
  
  // Otherwise render with the specified component
  return React.createElement(
    Component,
    { 
      className: [className, isLoading ? 'opacity-70' : ''].filter(Boolean).join(' ') 
    },
    translated
  );
};

export default TranslateText; 