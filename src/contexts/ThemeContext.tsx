import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';

// ─── Palette ─────────────────────────────────────────────────────────────────

const lightColors = {
  background: '#f0f4f8',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
  card: '#ffffff',
  text: '#1a2533',
  textSecondary: '#546e7a',
  textMuted: '#90a4ae',
  border: '#e0e0e0',
  divider: '#eeeeee',
  inputBackground: '#ffffff',
  modalBackground: '#ffffff',
  // Status colours (same both modes)
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  purple: '#8e44ad',
  // Primary
  primary: '#3498db',
  primaryDark: '#2980b9',
  // Alert card
  alertBg: '#fff8e1',
  alertBorder: '#ffe082',
};

const darkColors = {
  background: '#0d1117',
  surface: '#161b22',
  surfaceVariant: '#21262d',
  card: '#1c2128',
  text: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#484f58',
  border: '#30363d',
  divider: '#21262d',
  inputBackground: '#161b22',
  modalBackground: '#1c2128',
  // Status
  success: '#2ea043',
  warning: '#d29922',
  danger: '#da3633',
  info: '#388bfd',
  purple: '#a371f7',
  // Primary
  primary: '#388bfd',
  primaryDark: '#1f6feb',
  // Alert
  alertBg: '#272115',
  alertBorder: '#3d2e0a',
};

export type AppColors = typeof lightColors;

// ─── Custom MD3 theme overrides ──────────────────────────────────────────────

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    surface: lightColors.surface,
    onSurface: lightColors.text,
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    surface: darkColors.card,
    onSurface: darkColors.text,
  },
};

// ─── Context ─────────────────────────────────────────────────────────────────

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  paperTheme: typeof customLightTheme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const scheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem('app_theme_mode');
        if (storedMode === 'light' || storedMode === 'dark') {
          setThemeMode(storedMode);
        }
      } catch (e) {
        // ignore error
      } finally {
        setIsReady(true);
      }
    };
    loadThemeMode();
  }, []);

  const toggleTheme = async () => {
    const newMode = (themeMode === 'system' ? (scheme === 'dark' ? 'light' : 'dark') : (themeMode === 'dark' ? 'light' : 'dark'));
    setThemeMode(newMode);
    try {
      await AsyncStorage.setItem('app_theme_mode', newMode);
    } catch (e) {
      // ignore
    }
  };

  const isDark = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';

  const value: ThemeContextType = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    paperTheme: isDark ? customDarkTheme : customLightTheme,
    themeMode,
    toggleTheme,
  };

  if (!isReady) {
    return null; // or a loading screen if necessary
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export { customLightTheme, customDarkTheme };
export default ThemeContext;
