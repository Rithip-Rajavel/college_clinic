import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { responsive } from '../../utils/dimensions';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  color, 
  fullScreen = false 
}) => {
  const theme = useTheme();
  
  const spinnerColor = color || theme.colors.primary;
  
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: responsive.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default LoadingSpinner;
