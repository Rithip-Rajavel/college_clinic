import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 12 dimensions as reference)
const baseWidth = 390;
const baseHeight = 844;

// Scale factors
export const widthScale = (size: number) => (screenWidth / baseWidth) * size;
export const heightScale = (size: number) => (screenHeight / baseHeight) * size;

// Responsive dimensions
export const responsiveWidth = (percentage: number) => (screenWidth * percentage) / 100;
export const responsiveHeight = (percentage: number) => (screenHeight * percentage) / 100;

// Common responsive values
export const responsive = {
  padding: {
    xs: widthScale(8),
    sm: widthScale(12),
    md: widthScale(16),
    lg: widthScale(20),
    xl: widthScale(24),
  },
  margin: {
    xs: widthScale(4),
    sm: widthScale(8),
    md: widthScale(12),
    lg: widthScale(16),
    xl: widthScale(20),
  },
  fontSize: {
    xs: widthScale(12),
    sm: widthScale(14),
    md: widthScale(16),
    lg: widthScale(18),
    xl: widthScale(20),
    xxl: widthScale(24),
    xxxl: widthScale(28),
  },
  borderRadius: {
    sm: widthScale(4),
    md: widthScale(8),
    lg: widthScale(12),
    xl: widthScale(16),
  },
  iconSize: {
    xs: widthScale(16),
    sm: widthScale(20),
    md: widthScale(24),
    lg: widthScale(28),
    xl: widthScale(32),
  },
  height: heightScale,
};

// Device type detection
export const isTablet = screenWidth >= 768;
export const isSmallScreen = screenWidth < 360;

export default {
  widthScale,
  heightScale,
  responsiveWidth,
  responsiveHeight,
  responsive,
  isTablet,
  isSmallScreen,
};
