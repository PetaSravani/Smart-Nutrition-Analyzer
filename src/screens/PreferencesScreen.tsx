import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton, Checkbox } from '../components';
import { CommonScreenProps, UserPrefs, HealthHistory } from '../types';

// ---------------------------------------------------------------------------
// PreferencesScreen
// ---------------------------------------------------------------------------
type PreferencesProps = CommonScreenProps & {
  setUserPrefs: React.Dispatch<React.SetStateAction<UserPrefs>>;
};

export const PreferencesScreen: React.FC<PreferencesProps> = ({
  setScreen,
  userPrefs,
  setUserPrefs,
}) => (
  <SafeAreaView style={styles.screenContainer}>
    <Header title="Goals & Preferences" onBack={() => setScreen('Login')} />
    <ScrollView style={styles.content}>
      <Text style={styles.description}>Help us understand you better.</Text>

      <Text style={styles.sectionTitle}>What is your primary goal?</Text>
      <View style={styles.preferenceGrid}>
        {['Weight Loss', 'Weight Gain', 'Maintenance', 'Fitness'].map(goal => (
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
                userPrefs.goal === goal && styles.preferenceChipTextSelected,
              ]}
            >
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>What are your daily goals?</Text>
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

      <Text style={styles.sectionTitle}>
        What are your weekly goals? (Optional)
      </Text>
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
        placeholder="e.g., Avocado, Salmon, Almonds"
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
        placeholder="e.g., Peanuts, Shellfish, Cilantro"
        placeholderTextColor={theme.textLight}
        value={userPrefs.dislikes || ''}
        onChangeText={t => setUserPrefs({ ...userPrefs, dislikes: t })}
        multiline
      />
      <CustomButton
        title="Next: Health History"
        onPress={() => setScreen('HealthIssues')}
        style={{ marginTop: 10, marginBottom: 40 }}
      />
    </ScrollView>
  </SafeAreaView>
);

// ---------------------------------------------------------------------------
// HealthIssuesScreen
// ---------------------------------------------------------------------------
type HealthProps = CommonScreenProps & {
  setHealthHistory: React.Dispatch<React.SetStateAction<HealthHistory>>;
};

export const HealthIssuesScreen: React.FC<HealthProps> = ({
  setScreen,
  healthHistory,
  setHealthHistory,
}) => {
  const commonIssues = [
    'Heart Condition',
    'Diabetes',
    'High Blood Pressure',
    'Food Allergies',
  ];

  const toggleIssue = (issue: string) => {
    const current = healthHistory.conditions || [];
    setHealthHistory(prev => ({
      ...prev,
      conditions: current.includes(issue)
        ? current.filter(i => i !== issue)
        : [...current, issue],
    }));
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header title="Health History" onBack={() => setScreen('Preferences')} />
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Select any pre-existing conditions for safer recommendations.
        </Text>
        {commonIssues.map(issue => (
          <Checkbox
            key={issue}
            label={issue}
            isSelected={(healthHistory.conditions || []).includes(issue)}
            onValueChange={() => toggleIssue(issue)}
          />
        ))}
        <Text style={styles.sectionTitle}>
          Other Conditions or Specific Allergies
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Celiac Disease, Lactose Intolerance"
          placeholderTextColor={theme.textLight}
          value={healthHistory.other || ''}
          onChangeText={t => setHealthHistory({ ...healthHistory, other: t })}
          multiline
        />
        <CustomButton
          title="Finish Setup & Go Home"
          onPress={() => setScreen('Home')}
          style={{ marginTop: 10, marginBottom: 40 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
