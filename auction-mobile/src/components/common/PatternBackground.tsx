import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';

interface PatternBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

const PatternBackground: React.FC<PatternBackgroundProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background Image */}
      <ImageBackground
        source={require('../../../assets/bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Subtle Overlay for better readability */}
        <View style={styles.overlay} />
        
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Very subtle white overlay
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

export default PatternBackground; 