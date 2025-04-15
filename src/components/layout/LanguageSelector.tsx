import React from 'react';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/hooks/useLanguage';

const LanguageSelector = () => {
  const { language, setLanguage, languages, t } = useLanguage();

  const handleLanguageChange = (code: string) => {
    console.log('Changing language to:', code);
    setLanguage(code as any);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={t("select_language")}
        >
          <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md shadow-lg"
      >
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code} 
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="flex items-center text-gray-900 dark:text-gray-100">
              {lang.name}
              {language === lang.code && <Check className="h-4 w-4 ml-2 text-green-500" />}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">
              {lang.code.toUpperCase()}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
