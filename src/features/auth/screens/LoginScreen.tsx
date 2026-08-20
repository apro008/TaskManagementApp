import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../../components/Button';
import { Input, type InputHandle } from '../../../components/Input';
import { Screen } from '../../../components/Screen';
import { env } from '../../../config/env';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useTheme } from '../../../theme/ThemeProvider';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { errorCleared, login } from '../store/authSlice';

export default function LoginScreen({
  navigation,
}: AuthStackScreenProps<'Login'>) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { busy, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const passwordRef = useRef<InputHandle>(null);

  const valid = email.includes('@') && password.length >= 6;

  function submit() {
    if (!valid) return;
    dispatch(login({ email, password }));
  }

  function goSignUp() {
    dispatch(errorCleared());
    navigation.navigate('SignUp');
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontSize: theme.fontSize.xl },
            ]}
          >
            {env.appName}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Sign in to keep your tasks in sync.
          </Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@example.com"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <Input
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="At least 6 characters"
              returnKeyType="go"
              onSubmitEditing={submit}
            />

            {error ? (
              <Text style={[styles.error, { color: theme.colors.danger }]}>
                {error}
              </Text>
            ) : null}

            <Button
              label="Log in"
              onPress={submit}
              loading={busy}
              disabled={!valid}
            />

            <Pressable onPress={goSignUp} style={styles.link}>
              <Text style={{ color: theme.colors.primary }}>
                No account? Sign up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontWeight: '700' },
  subtitle: { fontSize: 15, marginTop: 6, marginBottom: 28 },
  form: { width: '100%' },
  error: { fontSize: 13, marginBottom: 12 },
  link: { alignItems: 'center', paddingVertical: 16 },
});
