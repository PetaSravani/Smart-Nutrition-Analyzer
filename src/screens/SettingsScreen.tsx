import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { signOut, Auth } from 'firebase/auth';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton, Checkbox, BottomNav } from '../components';
import { CommonScreenProps, UserPrefs, HealthHistory } from '../types';

type Props = CommonScreenProps & {
  setUserPrefs: React.Dispatch<React.SetStateAction<UserPrefs>>;
  setHealthHistory: React.Dispatch<React.SetStateAction<HealthHistory>>;
  userEmail: string | null;
  auth: Auth | null;
};

export const SettingsScreen: React.FC<Props> = ({
  setScreen,
  userPrefs,
  setUserPrefs,
  healthHistory,
  setHealthHistory,
  userEmail,
  auth,
}) => {
  const [message, setMessage] = useState('');

  const handleSave = () => {
    // Actual saving is handled by the debounced useEffect in App.tsx
    setMessage('Settings Saved!');
    setTimeout(() => setMessage(''), 1500);
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      // onAuthStateChanged in App.tsx handles redirect to Login
    } catch {
      setMessage('Error signing out.');
    }
  };

  const commonIssues = [
    'Heart Condition',
    'Diabetes',
    'High Blood Pressure',
    'Food Allergies',
  ];

  return (
    <SafeAreaView style={styles.screenContainerWithNav}>
      <Header title="Settings" />
      <ScrollView style={styles.content}>
        {message ? <Text style={styles.successMessage}>{message}</Text> : null}

        <Text style={styles.sectionTitle}>Account</Text>
        <Text
          style={{ marginBottom: 15, color: theme.textLight, fontSize: 16 }}
        >
          Email: {userEmail || 'N/A'}
        </Text>
        <CustomButton
          title="Sign Out"
          onPress={handleSignOut}
          secondary
          style={{ marginBottom: 20 }}
        />

        <Text style={[styles.title, { marginTop: 0 }]}>
          Goals & Preferences
        </Text>
        <Text style={styles.sectionTitle}>Primary Goal</Text>
        <View style={styles.preferenceGrid}>
          {['Weight Loss', 'Weight Gain', 'Maintenance', 'Fitness'].map(
            goal => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.preferenceChip,
                  userPrefs.goal === goal && styles.preferenceChipSelected,
                ]}
                onPress={() => setUserPrefs({ ...userPrefs, goal })}
              >
                <Text
                  style={[
                    styles.preferenceChipText,
                    userPrefs.goal === goal &&
                      styles.preferenceChipTextSelected,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <Text style={styles.sectionTitle}>Daily Goals</Text>
        <View style={styles.goalInputGrid}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Calories (cal)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g., 2000"
              placeholderTextColor={theme.textLight}
              value={userPrefs.calorieGoal?.toString() || ''}
              onChangeText={t =>
                setUserPrefs({ ...userPrefs, calorieGoal: parseInt(t) || 0 })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g., 50"
              placeholderTextColor={theme.textLight}
              value={userPrefs.proteinGoal?.toString() || ''}
              onChangeText={t =>
                setUserPrefs({ ...userPrefs, proteinGoal: parseInt(t) || 0 })
              }
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Weekly Goals</Text>
        <View style={styles.goalInputGrid}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Calories (cal)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g., 14000"
              placeholderTextColor={theme.textLight}
              value={userPrefs.weeklyCalorieGoal?.toString() || ''}
              onChangeText={t =>
                setUserPrefs({
                  ...userPrefs,
                  weeklyCalorieGoal: parseInt(t) || 0,
                })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g., 350"
              placeholderTextColor={theme.textLight}
              value={userPrefs.weeklyProteinGoal?.toString() || ''}
              onChangeText={t =>
                setUserPrefs({
                  ...userPrefs,
                  weeklyProteinGoal: parseInt(t) || 0,
                })
              }
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Foods you LIKE</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Avocado, Salmon"
          placeholderTextColor={theme.textLight}
          value={userPrefs.likes || ''}
          onChangeText={t => setUserPrefs({ ...userPrefs, likes: t })}
          multiline
        />
        <Text style={styles.sectionTitle}>
          Foods you DISLIKE or are allergic to
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Peanuts, Shellfish"
          placeholderTextColor={theme.textLight}
          value={userPrefs.dislikes || ''}
          onChangeText={t => setUserPrefs({ ...userPrefs, dislikes: t })}
          multiline
        />

        <Text style={styles.sectionTitle}>Health Conditions</Text>
        {commonIssues.map(issue => (
          <Checkbox
            key={issue}
            label={issue}
            isSelected={(healthHistory.conditions || []).includes(issue)}
            onValueChange={() =>
              setHealthHistory(prev => ({
                ...prev,
                conditions: (prev.conditions || []).includes(issue)
                  ? (prev.conditions || []).filter(i => i !== issue)
                  : [...(prev.conditions || []), issue],
              }))
            }
          />
        ))}
        <Text style={styles.sectionTitle}>Other Conditions</Text>
        <TextInput
          style={styles.textArea}
          placeholderTextColor={theme.textLight}
          value={healthHistory.other || ''}
          onChangeText={t => setHealthHistory({ ...healthHistory, other: t })}
          multiline
        />

        <CustomButton
          title="Save Changes"
          onPress={handleSave}
          style={{ marginTop: 20, marginBottom: 40 }}
        />
      </ScrollView>
      <BottomNav setScreen={setScreen} activeScreen="Settings" />
    </SafeAreaView>
  );
};
