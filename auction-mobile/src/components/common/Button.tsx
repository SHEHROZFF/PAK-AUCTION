import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, scaleFont } from '../../utils/responsive';
import { THEME_COLORS } from '../../constants/api';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'medium',
}) => {
  const isDisabled = disabled || loading;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : THEME_COLORS.primary[500]}
          style={styles.loader}
          size={size === 'small' ? 'small' : 'large'}
        />
      )}
      <Text
        style={[
          styles.text,
          styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as TextStyle,
          styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as TextStyle,
          isDisabled && styles.textDisabled,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </>
  );

  const buttonStyle = [
    styles.button,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as ViewStyle,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as ViewStyle,
    isDisabled && styles.buttonDisabled,
    style,
  ];

  if (variant === 'primary' && !isDisabled) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[buttonStyle, styles.primaryShadow]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={isDisabled}
        >
          <LinearGradient
            colors={[
              THEME_COLORS.primary[400], 
              THEME_COLORS.primary[500], 
              THEME_COLORS.primary[600]
            ]}
            start={[0, 0]}
            end={[1, 1]}
            locations={[0, 0.5, 1]}
            style={[
              styles.gradient,
              styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as ViewStyle,
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={isDisabled}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  buttonSmall: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    minHeight: verticalScale(40),
  } as ViewStyle,
  buttonMedium: {
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(14),
    minHeight: verticalScale(52),
  } as ViewStyle,
  buttonLarge: {
    paddingHorizontal: scale(40),
    paddingVertical: verticalScale(18),
    minHeight: verticalScale(60),
  } as ViewStyle,
  buttonPrimary: {
    backgroundColor: THEME_COLORS.primary[500],
    shadowColor: THEME_COLORS.primary[600],
    shadowOffset: {
      width: 0,
      height: verticalScale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 8,
  } as ViewStyle,
  buttonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: scale(2),
    borderColor: THEME_COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  } as ViewStyle,
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: scale(2),
    borderColor: THEME_COLORS.primary[500],
    shadowColor: THEME_COLORS.primary[200],
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(4),
    elevation: 2,
  } as ViewStyle,
  buttonText: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  buttonDisabled: {
    backgroundColor: THEME_COLORS.gray[300],
    borderColor: THEME_COLORS.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle,
  primaryShadow: {
    shadowColor: THEME_COLORS.primary[600],
    shadowOffset: {
      width: 0,
      height: verticalScale(6),
    },
    shadowOpacity: 0.4,
    shadowRadius: scale(12),
    elevation: 10,
  } as ViewStyle,
  gradient: {
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: scale(4),
    paddingVertical: verticalScale(2),
  } as ViewStyle,
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  } as TextStyle,
  textSmall: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(18),
  } as TextStyle,
  textMedium: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(20),
  } as TextStyle,
  textLarge: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(22),
  } as TextStyle,
  textPrimary: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  textSecondary: {
    color: THEME_COLORS.gray[700],
    fontWeight: '600',
  } as TextStyle,
  textOutline: {
    color: THEME_COLORS.primary[600],
    fontWeight: '600',
  } as TextStyle,
  textText: {
    color: THEME_COLORS.primary[600],
    fontWeight: '600',
  } as TextStyle,
  textDisabled: {
    color: THEME_COLORS.gray[500],
  } as TextStyle,
  loader: {
    marginRight: scale(8),
  } as ViewStyle,
});

export default Button; 