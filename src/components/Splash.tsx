import React from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import logo from '../assets/logo.png';
import { env, isProd } from '../config/env';
import { envColors, splashColors } from '../theme/colors';

export function Splash() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <View style={styles.caption}>
        <Text style={styles.name}>{env.appName}</Text>
        {isProd ? null : (
          <Text style={[styles.env, { backgroundColor: envColors[env.name] }]}>
            {env.name}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: splashColors.background,
  },
  logo: { width: 120, height: 120 },
  caption: {
    position: 'absolute',
    top: '50%',
    marginTop: 76,
    alignItems: 'center',
  },
  name: { color: splashColors.text, fontSize: 20, fontWeight: '700' },
  env: {
    marginTop: 12,
    color: splashColors.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
