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
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useTheme } from '../../../theme/ThemeProvider';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { errorCleared, register } from '../store/authSlice';

export default function SignUpScreen({
  navigation,
}: AuthStackScreenProps<'SignUp'>) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { busy, error } = useAppSelector(state => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const emailRef = useRef<InputHandle>(null);
  const passwordRef = useRef<InputHandle>(null);
  const confirmRef = useRef<InputHandle>(null);

  const valid =
    name.trim().length > 1 &&
    email.includes('@') &&
    password.length >= 6 &&
    password === confirm;

  function submit() {
    if (!valid) return;
    dispatch(register({ email, password, name }));
  }

  function goLogin() {
    dispatch(errorCleared());
    navigation.goBack();
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
            Create account
          </Text>

          <View style={styles.form}>
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoComplete="name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <Input
              ref={emailRef}
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <Input
              ref={confirmRef}
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="new-password"
              placeholder="Repeat password"
              returnKeyType="go"
              onSubmitEditing={submit}
            />

            {password !== confirm && confirm.length > 0 ? (
              <Text style={[styles.error, { color: theme.colors.danger }]}>
                Passwords do not match.
              </Text>
            ) : null}

            {error ? (
              <Text style={[styles.error, { color: theme.colors.danger }]}>
                {error}
              </Text>
            ) : null}

            <Button
              label="Sign up"
              onPress={submit}
              loading={busy}
              disabled={!valid}
            />

            <Pressable onPress={goLogin} style={styles.link}>
              <Text style={{ color: theme.colors.primary }}>
                Already have an account? Log in
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
  title: { fontWeight: '700', marginBottom: 24 },
  form: { width: '100%' },
  error: { fontSize: 13, marginBottom: 12 },
  link: { alignItems: 'center', paddingVertical: 16 },
});
