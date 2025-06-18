import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../../constants/api';
import { scale, verticalScale, scaleFont } from '../../utils/responsive';

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoFocus?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  autoFocus = false,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isSecureEntry = secureTextEntry && !showPassword;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={THEME_COLORS.gray[400]}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={THEME_COLORS.gray[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecureEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          autoCorrect={false}
          spellCheck={false}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={THEME_COLORS.gray[400]}
            />
          </TouchableOpacity>
        )}
        
        {!secureTextEntry && rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={THEME_COLORS.gray[400]}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: THEME_COLORS.gray[700],
    marginBottom: verticalScale(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: THEME_COLORS.gray[300],
    borderRadius: scale(8),
    backgroundColor: '#fff',
    minHeight: verticalScale(48),
  },
  inputContainerError: {
    borderColor: THEME_COLORS.error,
  },
  inputContainerDisabled: {
    backgroundColor: THEME_COLORS.gray[50],
    borderColor: THEME_COLORS.gray[200],
  },
  input: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[900],
    minHeight: verticalScale(48),
  },
  inputWithLeftIcon: {
    paddingLeft: scale(8),
  },
  inputWithRightIcon: {
    paddingRight: scale(8),
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: verticalScale(96),
  },
  leftIcon: {
    marginLeft: scale(16),
  },
  rightIcon: {
    padding: scale(12),
  },
  errorText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.error,
    marginTop: verticalScale(4),
  },
});

export default InputField; 