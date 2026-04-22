import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton, BottomNav } from '../components';
import { CommonScreenProps, AllergyLogItem, UserPrefs } from '../types';

// ---------------------------------------------------------------------------
// AllergyTrackerScreen
// ---------------------------------------------------------------------------
type AllergyTrackerProps = CommonScreenProps & { allergyLog: AllergyLogItem[] };

export const AllergyTrackerScreen: React.FC<AllergyTrackerProps> = ({
  setScreen,
  allergyLog,
}) => (
  <SafeAreaView style={styles.screenContainerWithNav}>
    <Header title="Allergy Log" />
    <ScrollView style={styles.content}>
      <Text style={styles.description}>
        A history of your reported reactions. The system will warn you if you
        scan these items again.
      </Text>
      <CustomButton
        title="Add Allergy Manually"
        onPress={() => setScreen('ManualAllergy')}
        icon="✍️"
      />
      <View style={{ marginTop: 20 }}>
        {allergyLog.length === 0 ? (
          <Text style={styles.centeredText}>No allergies logged yet.</Text>
        ) : (
          allergyLog.map((item, index) => (
            <View style={styles.card} key={item.id || index}>
              <Text style={styles.sectionTitle}>{item.food}</Text>
              <Text style={[styles.description, { textAlign: 'left' }]}>
                Symptoms: {item.symptoms}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  textAlign: 'right',
                  color: theme.textLight,
                  marginTop: 10,
                }}
              >
                {item.date
                  ? new Date(
                      typeof item.date === 'string'
                        ? item.date
                        : (item.date as any).toDate(),
                    ).toLocaleString()
                  : ''}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
    <BottomNav setScreen={setScreen} activeScreen="AllergyTracker" />
  </SafeAreaView>
);

// ---------------------------------------------------------------------------
// ManualAllergyScreen
// ---------------------------------------------------------------------------
type ManualAllergyProps = CommonScreenProps & {
  setUserPrefs: React.Dispatch<React.SetStateAction<UserPrefs>>;
};

export const ManualAllergyScreen: React.FC<ManualAllergyProps> = ({
  setScreen,
  userPrefs,
  setUserPrefs,
  userId,
  db,
  appId,
}) => {
  const [food, setFood] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!food || !symptoms) {
      setMessage('Please fill out both fields.');
      return;
    }

    if (userId && db) {
      try {
        await addDoc(
          collection(db, 'artifacts', appId, 'users', userId, 'allergyLog'),
          { food, symptoms, date: Timestamp.now() },
        );
      } catch {
        setMessage('Error saving allergy. Please try again.');
        return;
      }
    } else {
      setMessage('Error: Not logged in.');
      return;
    }

    // Also add to dislikes so future scans flag it
    const dislikesSet = new Set(
      (userPrefs.dislikes || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    );
    if (!dislikesSet.has(food)) {
      dislikesSet.add(food);
      setUserPrefs(prev => ({
        ...prev,
        dislikes: Array.from(dislikesSet).join(', '),
      }));
    }

    setMessage('Allergy saved!');
    setTimeout(() => setScreen('AllergyTracker'), 1500);
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header title="Add Allergy" onBack={() => setScreen('AllergyTracker')} />
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Log a food and the reaction you had to it.
        </Text>
        <Text style={styles.inputLabel}>Food Item</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Peanuts"
          placeholderTextColor={theme.textLight}
          value={food}
          onChangeText={setFood}
        />
        <Text style={styles.inputLabel}>Symptoms / Reaction</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Itchy skin, hives"
          placeholderTextColor={theme.textLight}
          value={symptoms}
          onChangeText={setSymptoms}
          multiline
        />
        {message ? (
          <Text
            style={
              message.includes('saved')
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {message}
          </Text>
        ) : null}
        <CustomButton
          title="Save Allergy"
          onPress={handleSave}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
