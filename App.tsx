/**
 * Campus Health System
 * Digital medical record management for university campus
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
