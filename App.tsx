/**
 * Campus Health System
 * Digital medical record management for university campus
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperProvider, FAB } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <FAB
      icon={isDark ? 'weather-sunny' : 'weather-night'}
      style={[
        styles.fab,
        { bottom: insets.bottom + 80 }
      ]}
      onPress={toggleTheme}
      size="small"
    />
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const { paperTheme, isDark, colors } = useTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
        <AppNavigator />
        <ThemeToggleButton />
      </View>
    </PaperProvider>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    left: 16,
    zIndex: 9999,
    bottom: 200,
  },
});

export default App;
