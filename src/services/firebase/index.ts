import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

export function auth() {
  return getAuth(getApp());
}

export function firestore() {
  return getFirestore(getApp());
}
