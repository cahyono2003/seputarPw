import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Image, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPLASH_MS = 2200;

export default function SplashRoute() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/(tabs)/beranda');
    }, SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  // On web, try to hide the default "titlebar" (which is the browser tab bar, not removable),
  // but for Expo web, ensure no spurious header. For native, StatusBar default.

  // We make sure not to render any header/UI up top, just our content.
  // If this component is still showing a black bar with "index" above,
  // make sure to set "headerShown: false" in your navigation or layout configuration.

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Platform.OS === 'android' ? 0 : insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B3D5C"
        translucent={true}
      />
      <View style={styles.bubble} />
      <View style={[styles.bubble, styles.bubble2]} />
      <Image
        source={require('@/assets/images/iconlogo.png')}
        style={styles.iconLogo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.title}>Calculator Pixel World</Text>
      <Text style={styles.subtitle}>Penghitung & estimasi nilai ikan</Text>
      <ActivityIndicator size="large" color="#7DD3FC" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B3D5C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bubble: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(125, 211, 252, 0.12)',
    top: '18%',
    left: -80,
  },
  bubble2: {
    width: 200,
    height: 200,
    borderRadius: 100,
    top: '55%',
    left: undefined,
    right: -60,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  iconLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F0F9FF',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
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
