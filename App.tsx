// npx react-native run-android

import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator } from 'react-native';

// Firebase
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  Auth,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  setLogLevel,
  Firestore,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';

// Config & types
import { firebaseConfig, APP_ID } from './src/config';
import {
  ScreenName,
  UserPrefs,
  HealthHistory,
  FoodLogItem,
  AllergyLogItem,
  ScannedItem,
  RLFeedbackData,
} from './src/types';

// Styles & theme
import { styles } from './src/styles';
import { theme } from './src/theme';

// Screens
import {
  OnboardingScreen,
  LoginScreen,
  PreferencesScreen,
  HealthIssuesScreen,
  HomeScreen,
  ScanScreen,
  AnalysisScreen,
  AllergyTrackerScreen,
  ManualAllergyScreen,
  ManualEntryScreen,
  LogCommonItemScreen,
  ReportsScreen,
  FoodReportScreen,
  FoodChoicesScreen,
  LogHistoryScreen,
  SettingsScreen,
} from './src/screens';

// ─────────────────────────────────────────────────────────────────────────────
// Default state values (defined once, re-used for reset on sign-out)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_PREFS: UserPrefs = {
  goal: 'Weight Loss',
  likes: '',
  dislikes: '',
  calorieGoal: 2000,
  proteinGoal: 50,
  weeklyCalorieGoal: 14000,
  weeklyProteinGoal: 350,
};
const DEFAULT_HEALTH: HealthHistory = { conditions: [], other: '' };

// ─────────────────────────────────────────────────────────────────────────────
// App component
// ─────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>('Loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);
  const [appInstance, setAppInstance] = useState<FirebaseApp | null>(null);

  const [userPrefs, setUserPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [healthHistory, setHealthHistory] =
    useState<HealthHistory>(DEFAULT_HEALTH);
  const [fullLog, setFullLog] = useState<FoodLogItem[]>([]);
  const [allergyLog, setAllergyLog] = useState<AllergyLogItem[]>([]);
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null);
  const [rlFeedback, setRlFeedback] = useState<RLFeedbackData>({});

  const unsubscribeProfileRef = useRef<Unsubscribe | null>(null);
  const unsubscribeFoodLogRef = useRef<Unsubscribe | null>(null);
  const unsubscribeAllergyLogRef = useRef<Unsubscribe | null>(null);
  const unsubscribeRLFeedbackRef = useRef<Unsubscribe | null>(null);

  // ── 1. Firebase init + auth listener ────────────────────────────────────
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);
      setLogLevel('debug');

      setAppInstance(app);
      setAuthInstance(auth);
      setDbInstance(db);

      const unsubscribeAuth = onAuthStateChanged(
        auth,
        async (user: User | null) => {
          if (user) {
            setUserId(user.uid);
            setUserEmail(
              user.email || (user.isAnonymous ? 'Guest User' : null),
            );

            const meta = user.metadata;
            const isNewUser = meta.creationTime === meta.lastSignInTime;
            const isVeryNew =
              meta.creationTime &&
              Date.now() - new Date(meta.creationTime).getTime() < 5000;

            if ((isNewUser || isVeryNew) && !user.isAnonymous) {
              const profileRef = doc(
                db,
                'artifacts',
                APP_ID,
                'users',
                user.uid,
                'profile',
                'userProfile',
              );
              const snap = await getDoc(profileRef);
              if (!snap.exists()) {
                await setDoc(
                  profileRef,
                  {
                    userPrefs: DEFAULT_PREFS,
                    healthHistory: DEFAULT_HEALTH,
                    createdAt: Timestamp.now(),
                  },
                  { merge: true },
                );
              }
              setScreen('Preferences');
            } else {
              setScreen('Home');
            }
          } else {
            // Signed out — reset all state
            setUserId(null);
            setUserEmail(null);
            setUserPrefs(DEFAULT_PREFS);
            setHealthHistory(DEFAULT_HEALTH);
            setFullLog([]);
            setAllergyLog([]);
            setRlFeedback({});

            unsubscribeProfileRef.current?.();
            unsubscribeFoodLogRef.current?.();
            unsubscribeAllergyLogRef.current?.();
            unsubscribeRLFeedbackRef.current?.();

            setScreen('Login');
          }
          setIsLoading(false);
        },
      );

      // Try anonymous sign-in if no user
      if (!auth.currentUser) {
        signInAnonymously(auth).catch(() => {
          setScreen('Login');
          setIsLoading(false);
        });
      } else {
        setUserId(auth.currentUser.uid);
        setUserEmail(
          auth.currentUser.email ||
            (auth.currentUser.isAnonymous ? 'Guest User' : null),
        );
        setIsLoading(false);
      }

      return () => unsubscribeAuth();
    } catch (error) {
      console.error('Firebase init error:', error);
      setIsLoading(false);
      setScreen('Login');
    }
  }, []);

  // ── 2. Firestore real-time listeners ────────────────────────────────────
  useEffect(() => {
    if (!userId || !dbInstance || isLoading) {
      unsubscribeProfileRef.current?.();
      unsubscribeFoodLogRef.current?.();
      unsubscribeAllergyLogRef.current?.();
      unsubscribeRLFeedbackRef.current?.();
      return;
    }

    // Profile
    const profileRef = doc(
      dbInstance,
      'artifacts',
      APP_ID,
      'users',
      userId,
      'profile',
      'userProfile',
    );
    unsubscribeProfileRef.current = onSnapshot(
      profileRef,
      snap => {
        if (snap.exists()) {
          const data = snap.data();
          setUserPrefs(prev => ({ ...prev, ...(data.userPrefs || {}) }));
          setHealthHistory(prev => ({
            ...prev,
            ...(data.healthHistory || {}),
            conditions: Array.isArray(data.healthHistory?.conditions)
              ? data.healthHistory.conditions
              : [],
          }));
        } else {
          setDoc(
            profileRef,
            { userPrefs, healthHistory, createdAt: Timestamp.now() },
            { merge: true },
          ).catch(console.error);
        }
      },
      console.error,
    );

    // Food log
    const foodLogRef = collection(
      dbInstance,
      'artifacts',
      APP_ID,
      'users',
      userId,
      'foodLog',
    );
    unsubscribeFoodLogRef.current = onSnapshot(
      query(foodLogRef, orderBy('date', 'desc'), limit(200)),
      snap => {
        setFullLog(
          snap.docs.map(d => ({
            ...(d.data() as Omit<FoodLogItem, 'id' | 'date'>),
            id: d.id,
            date: d.data().date?.toDate().toISOString(),
          })),
        );
      },
      console.error,
    );

    // Allergy log
    const allergyRef = collection(
      dbInstance,
      'artifacts',
      APP_ID,
      'users',
      userId,
      'allergyLog',
    );
    unsubscribeAllergyLogRef.current = onSnapshot(
      query(allergyRef, orderBy('date', 'desc'), limit(50)),
      snap => {
        setAllergyLog(
          snap.docs.map(d => ({
            ...(d.data() as Omit<AllergyLogItem, 'id' | 'date'>),
            id: d.id,
            date: d.data().date?.toDate().toISOString(),
          })),
        );
      },
      console.error,
    );

    // RL feedback
    const rlRef = collection(
      dbInstance,
      'artifacts',
      APP_ID,
      'users',
      userId,
      'rlSuggestionFeedback',
    );
    unsubscribeRLFeedbackRef.current = onSnapshot(
      rlRef,
      snap => {
        const feedback: RLFeedbackData = {};
        snap.docs.forEach(d => {
          feedback[d.id] = {
            likes: d.data().likes || 0,
            dislikes: d.data().dislikes || 0,
          };
        });
        setRlFeedback(feedback);
      },
      console.error,
    );

    return () => {
      unsubscribeProfileRef.current?.();
      unsubscribeFoodLogRef.current?.();
      unsubscribeAllergyLogRef.current?.();
      unsubscribeRLFeedbackRef.current?.();
    };
  }, [userId, dbInstance, isLoading]);

  // ── 3. Debounced profile save ────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        userId &&
        dbInstance &&
        authInstance &&
        !authInstance.currentUser?.isAnonymous
      ) {
        const profileRef = doc(
          dbInstance,
          'artifacts',
          APP_ID,
          'users',
          userId,
          'profile',
          'userProfile',
        );
        setDoc(
          profileRef,
          { userPrefs, healthHistory, updatedAt: Timestamp.now() },
          { merge: true },
        ).catch(console.error);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [userPrefs, healthHistory, userId, dbInstance, isLoading, authInstance]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getDailyLog = (): FoodLogItem[] => {
    const now = new Date();
    return (fullLog || []).filter(item => {
      if (!item.date) return false;
      try {
        const d = new Date(item.date as string);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      } catch {
        return false;
      }
    });
  };

  // ── Screen renderer ──────────────────────────────────────────────────────
  const renderScreen = () => {
    if (isLoading) {
      return (
        <View style={styles.screenContainerCentered}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={{ marginTop: 10, color: theme.textLight }}>
            Loading Account...
          </Text>
        </View>
      );
    }

    const dailyLog = getDailyLog();

    const common = {
      setScreen,
      userPrefs,
      healthHistory,
      userId,
      db: dbInstance,
      appId: APP_ID,
    };

    switch (screen) {
      case 'Onboarding':
        return <OnboardingScreen setScreen={setScreen} />;

      case 'Login':
        return (
          <LoginScreen
            {...common}
            userEmail={userEmail || ''}
            setUserEmail={setUserEmail}
            setUserId={setUserId}
            auth={authInstance}
            app={appInstance}
          />
        );

      case 'Preferences':
        return <PreferencesScreen {...common} setUserPrefs={setUserPrefs} />;

      case 'HealthIssues':
        return (
          <HealthIssuesScreen {...common} setHealthHistory={setHealthHistory} />
        );

      case 'Home':
        return <HomeScreen {...common} dailyLog={dailyLog} />;

      case 'Scan':
        return <ScanScreen {...common} setScannedItem={setScannedItem} />;

      case 'Analysis':
        return (
          <AnalysisScreen
            {...common}
            scannedItem={scannedItem}
            addAllergy={() => {}}
          />
        );

      case 'AllergyTracker':
        return <AllergyTrackerScreen {...common} allergyLog={allergyLog} />;

      case 'ManualAllergy':
        return <ManualAllergyScreen {...common} setUserPrefs={setUserPrefs} />;

      case 'ManualEntry':
        return <ManualEntryScreen {...common} />;

      case 'LogCommonItem':
        return (
          <LogCommonItemScreen {...common} healthHistory={healthHistory} />
        );

      case 'Reports':
        return (
          <ReportsScreen {...common} dailyLog={dailyLog} fullLog={fullLog} />
        );

      case 'FoodReport':
        return <FoodReportScreen {...common} dailyLog={dailyLog} />;

      case 'FoodChoices':
        return (
          <FoodChoicesScreen {...common} dailyLog={dailyLog} userId={userId} />
        );

      case 'LogHistory':
        return <LogHistoryScreen {...common} fullLog={fullLog} />;

      case 'Settings':
        return (
          <SettingsScreen
            {...common}
            setUserPrefs={setUserPrefs}
            setHealthHistory={setHealthHistory}
            userEmail={userEmail}
            auth={authInstance}
          />
        );

      default:
        return <OnboardingScreen setScreen={setScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.mobileFrame}>{renderScreen()}</SafeAreaView>
  );
};

export default App;
