import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPLASH_MS = 2200;

export default function SplashRoute() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/(tabs)/beranda');
    }, SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B3D5C' }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B3D5C"
        translucent={true}
      />
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={[
          styles.background,
          {
            paddingTop: Platform.OS === 'android' ? 0 : insets.top,
            paddingBottom: insets.bottom,
            width,
            height,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
          },
        ]}
        resizeMode="cover"
        imageStyle={{ opacity: 0.94 }}
      >
        {/* Decorative Bubbles */}
        <View style={[styles.bubble, styles.bubble1]} />
        <View style={[styles.bubble, styles.bubble2]} />
        <View style={[styles.bubble, styles.bubble3]} />
      </ImageBackground>
      <View style={styles.contentWrapper}>
        <Image
          source={require('@/assets/images/iconlogo.png')}
          style={styles.iconLogo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.title}>Calculator Pixel World</Text>
        <Text style={styles.subtitle}>Fish value calculation & estimation</Text>
        <ActivityIndicator size="large" color="#7DD3FC" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // width, height, position handled in the component for full-bleed.
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  bubble: {
    position: 'absolute',
    zIndex: 1,
  },
  bubble1: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(125, 211, 252, 0.13)',
    top: 48,
    left: -60,
  },
  bubble2: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(56, 189, 248, 0.11)',
    bottom: 94,
    right: -40,
  },
  bubble3: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    top: 150,
    right: 28,
  },
  iconLogo: {
    width: 150,
    height: 150,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F0F9FF',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(11,61,92,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#BAE6FD',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  loader: {
    marginTop: 32,
  },
});
