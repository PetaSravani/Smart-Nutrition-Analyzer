import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Auth,
} from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton } from '../components';
import { CommonScreenProps, ScreenName } from '../types';

type Props = CommonScreenProps & {
  userEmail: string;
  setUserEmail: (email: string) => void;
  setUserId: (id: string) => void;
  auth: Auth | null;
  app: FirebaseApp | null;
};

export const LoginScreen: React.FC<Props> = ({
  setScreen,
  userEmail,
  setUserEmail,
  setUserId,
  auth,
  app,
  appId,
}) => {
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!auth || !app) {
      setError('Firebase not initialized. Please restart the app.');
      return;
    }
    if (!userEmail || !userEmail.includes('@') || !password) {
      setError('Please enter a valid email and password.');
      return;
    }
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(
          auth,
          userEmail,
          password,
        );
        setUserId(cred.user.uid);
        const db = getFirestore(app);
        await setDoc(
          doc(
            db,
            'artifacts',
            appId,
            'users',
            cred.user.uid,
            'profile',
            'userProfile',
          ),
          {},
          { merge: true },
        );
        setScreen('Preferences');
      } else {
        const cred = await signInWithEmailAndPassword(
          auth,
          userEmail,
          password,
        );
        setUserId(cred.user.uid);
        // onAuthStateChanged in App handles navigation
      }
    } catch (e: any) {
      const codeMap: Record<string, string> = {
        'auth/email-already-in-use':
          'This email is already registered. Please sign in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'Incorrect email or password.',
        'auth/wrong-password': 'Incorrect email or password.',
        'auth/invalid-credential': 'Incorrect email or password.',
      };
      if (e.code === 'auth/email-already-in-use') setIsSignUp(false);
      setError(codeMap[e.code] || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header
        title={isSignUp ? 'Sign Up' : 'Sign In'}
        onBack={() => setScreen('Onboarding')}
      />
      <ScrollView contentContainerStyle={styles.contentScrollable}>
        <Text style={styles.description}>
          {isSignUp
            ? 'Create an account to save your data.'
            : 'Sign in to access your saved data.'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.textLight}
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={isSignUp ? 'new-password' : 'password'}
        />
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        <CustomButton
          title={isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          onPress={handleAuth}
          disabled={isLoading}
        />
        <TouchableOpacity
          style={{ marginTop: 15 }}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={{ color: theme.secondaryColor, textAlign: 'center' }}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
