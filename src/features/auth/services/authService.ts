import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from '@react-native-firebase/auth';
import { auth } from '../../../services/firebase';

export type AuthUser = {
  uid: string;
  email: string | null;
  name: string | null;
};

export function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return { uid: user.uid, email: user.email, name: user.displayName };
}

export async function signUp(email: string, password: string, name: string) {
  const result = await createUserWithEmailAndPassword(auth(), email, password);
  if (name) {
    await updateProfile(result.user, { displayName: name });
    await reload(result.user);
  }
  return toAuthUser(auth().currentUser);
}

export async function signIn(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth(), email, password);
  return toAuthUser(result.user);
}

export async function logOut() {
  await signOut(auth());
}

export function watchAuth(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth(), user => callback(toAuthUser(user)));
}

export function authErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    case 'auth/network-request-failed':
      return 'No connection. Check your network and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    default:
      return (error as Error)?.message ?? 'Something went wrong.';
  }
}
