import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={theme === "light" ? t("switch_to_dark") : t("switch_to_light")}
        >
          {theme === "light" ? (
            <Sun className="h-5 w-5 text-amber-500" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-400" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {theme === "light" ? t("switch_to_dark") : t("switch_to_light")}
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle; 