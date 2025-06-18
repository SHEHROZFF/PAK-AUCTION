import { useWindowDimensions, PixelRatio } from 'react-native';

// Hook to get current window dimensions
export const useResponsiveDimensions = () => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  
  // Base dimensions (design was made for iPhone 14 Pro Max dimensions)
  const BASE_WIDTH = 430;
  const BASE_HEIGHT = 932;

  // Scale function for width
  const scaleWidth = (size: number): number => {
    return (SCREEN_WIDTH / BASE_WIDTH) * size;
  };

  // Scale function for height
  const scaleHeight = (size: number): number => {
    return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
  };

  // Scale function for font size
  const scaleFont = (size: number): number => {
    const newSize = (SCREEN_WIDTH / BASE_WIDTH) * size;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };

  // General scale function (uses width as base)
  const scale = (size: number): number => {
    return scaleWidth(size);
  };

  // Moderate scale function (less aggressive scaling)
  const moderateScale = (size: number, factor: number = 0.5): number => {
    return size + (scale(size) - size) * factor;
  };

  // Vertical scale function (for heights, margins, paddings)
  const verticalScale = (size: number): number => {
    return scaleHeight(size);
  };

  // Responsive percentage width
  const wp = (percentage: number): number => {
    return (SCREEN_WIDTH * percentage) / 100;
  };

  // Responsive percentage height
  const hp = (percentage: number): number => {
    return (SCREEN_HEIGHT * percentage) / 100;
  };

  // Get responsive dimensions
  const getResponsiveDimensions = () => ({
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    isSmallDevice: SCREEN_WIDTH < 375,
    isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
    isLargeDevice: SCREEN_WIDTH >= 414,
  });

  return {
    scale,
    scaleWidth,
    scaleHeight,
    scaleFont,
    moderateScale,
    verticalScale,
    wp,
    hp,
    getResponsiveDimensions,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
  };
};

// Legacy static functions for backward compatibility (using default dimensions)
import { Dimensions } from 'react-native';
const { width: DEFAULT_SCREEN_WIDTH, height: DEFAULT_SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 430;
const BASE_HEIGHT = 932;

export const scale = (size: number): number => {
  return (DEFAULT_SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const verticalScale = (size: number): number => {
  return (DEFAULT_SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const scaleFont = (size: number): number => {
  const newSize = (DEFAULT_SCREEN_WIDTH / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const wp = (percentage: number): number => {
  return (DEFAULT_SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (DEFAULT_SCREEN_HEIGHT * percentage) / 100;
};

export default {
  scale,
  verticalScale,
  scaleFont,
  wp,
  hp,
  useResponsiveDimensions,
}; 