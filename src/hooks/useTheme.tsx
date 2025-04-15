import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      // If user has explicitly set a theme, use that
      if (savedTheme) {
        return savedTheme;
      }
      // Otherwise, use system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    // Default to light on server
    return "light";
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem("theme", theme);
    
    // Log for debugging
    console.log("Theme set to:", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    console.log("Setting theme to:", newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      console.log("Toggling theme from", prevTheme, "to", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 