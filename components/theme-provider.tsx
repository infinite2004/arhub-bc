"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { useTheme as useNextThemesHook } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  systemTheme: string;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [systemTheme, setSystemTheme] = useState<string>("light");

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="arhub-theme"
      themes={["light", "dark", "system"]}
      {...props}
    >
      <ThemeContextProvider>
        {children}
      </ThemeContextProvider>
    </NextThemesProvider>
  );
}

function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  // Use next-themes hook here; do NOT use our own context hook to avoid recursion
  const { theme, setTheme, resolvedTheme } = useNextThemesHook();
  const [systemTheme, setSystemTheme] = useState<string>("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
  }, []);

  const contextValue: ThemeContextType = {
    theme: theme || "system",
    setTheme,
    systemTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    isSystem: theme === "system",
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for theme management
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook for accessing the raw next-themes hook
export function useNextTheme() {
  const { theme, setTheme, resolvedTheme } = useNextThemesHook();
  return { theme, setTheme, resolvedTheme };
}

// Theme toggle component
export function ThemeToggle() {
  const { theme, setTheme, isDark, isLight, isSystem } = useTheme();

  const toggleTheme = () => {
    if (isSystem) {
      setTheme("light");
    } else if (isLight) {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getThemeIcon = () => {
    if (isSystem) return <Monitor className="h-4 w-4" />;
    if (isLight) return <Sun className="h-4 w-4" />;
    return <Moon className="h-4 w-4" />;
  };

  const getThemeLabel = () => {
    if (isSystem) return "System";
    if (isLight) return "Light";
    return "Dark";
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground h-9 w-9 group"
      title={`Switch to ${isSystem ? "light" : isLight ? "dark" : "system"} theme`}
    >
      <span className="group-hover:scale-110 transition-transform duration-200">
        {getThemeIcon()}
      </span>
      <span className="sr-only">Switch to {getThemeLabel()} theme</span>
    </button>
  );
}

// Theme-aware component wrapper
export function withTheme<T extends object>(
  Component: React.ComponentType<T>,
  themeProps?: Partial<ThemeContextType>
) {
  return function WithTheme(props: T) {
    const themeContext = useTheme();
    const mergedProps = { ...themeContext, ...themeProps };
    
    return <Component {...props} {...mergedProps} />;
  };
}

// CSS variables for theme colors
export const themeColors = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 84% 4.9%)",
    card: "hsl(0 0% 100%)",
    "card-foreground": "hsl(222.2 84% 4.9%)",
    popover: "hsl(0 0% 100%)",
    "popover-foreground": "hsl(222.2 84% 4.9%)",
    primary: "hsl(222.2 47.4% 11.2%)",
    "primary-foreground": "hsl(210 40% 98%)",
    secondary: "hsl(210 40% 96%)",
    "secondary-foreground": "hsl(222.2 84% 4.9%)",
    muted: "hsl(210 40% 96%)",
    "muted-foreground": "hsl(215.4 16.3% 46.9%)",
    accent: "hsl(210 40% 96%)",
    "accent-foreground": "hsl(222.2 84% 4.9%)",
    destructive: "hsl(0 84.2% 60.2%)",
    "destructive-foreground": "hsl(210 40% 98%)",
    border: "hsl(214.3 31.8% 91.4%)",
    input: "hsl(214.3 31.8% 91.4%)",
    ring: "hsl(222.2 84% 4.9%)",
  },
  dark: {
    background: "hsl(222.2 84% 4.9%)",
    foreground: "hsl(210 40% 98%)",
    card: "hsl(222.2 84% 4.9%)",
    "card-foreground": "hsl(210 40% 98%)",
    popover: "hsl(222.2 84% 4.9%)",
    "popover-foreground": "hsl(210 40% 98%)",
    primary: "hsl(210 40% 98%)",
    "primary-foreground": "hsl(222.2 47.4% 11.2%)",
    secondary: "hsl(217.2 32.6% 17.5%)",
    "secondary-foreground": "hsl(210 40% 98%)",
    muted: "hsl(217.2 32.6% 17.5%)",
    "muted-foreground": "hsl(215 20.2% 65.1%)",
    accent: "hsl(217.2 32.6% 17.5%)",
    "accent-foreground": "hsl(210 40% 98%)",
    destructive: "hsl(0 62.8% 30.6%)",
    "destructive-foreground": "hsl(210 40% 98%)",
    border: "hsl(217.2 32.6% 17.5%)",
    input: "hsl(217.2 32.6% 17.5%)",
    ring: "hsl(212.7 26.8% 83.9%)",
  },
};

// Apply theme colors to CSS variables
export function applyThemeColors(theme: "light" | "dark") {
  const colors = themeColors[theme];
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
