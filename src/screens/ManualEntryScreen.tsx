import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton } from '../components';
import { analyzeManualFoodItem } from '../api/gemini';
import { getMealTypeByTime } from '../utils/helpers';
import { FULL_FOOD_DATABASE } from '../data/foodDatabase';
import { CommonScreenProps } from '../types';

export const ManualEntryScreen: React.FC<CommonScreenProps> = ({
  setScreen,
  userPrefs,
  healthHistory,
  userId,
  db,
  appId,
}) => {
  const [foodItem, setFoodItem] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState<any>(null);

  const handleAnalyzeItem = async () => {
    if (!foodItem) {
      setMessage('Please enter the name of the item.');
      return;
    }
    setMessage('');
    setIsLoading(true);
    setAnalyzedFood(null);

    if (
      FULL_FOOD_DATABASE.some(
        item => item.name.toLowerCase() === foodItem.toLowerCase(),
      )
    ) {
      setMessage(
        `"${foodItem}" is in the common items list. Please use the 'Add Common Item' button.`,
      );
      setIsLoading(false);
      return;
    }

    const result = await analyzeManualFoodItem(
      foodItem,
      userPrefs,
      healthHistory,
    );
    setIsLoading(false);
    if (result.error) setMessage(result.error);
    else setAnalyzedFood(result);
  };

  const handleAddMeal = async () => {
    if (!analyzedFood) return;
    const mealType = getMealTypeByTime();
    const foodToLog = { ...analyzedFood, mealType, date: Timestamp.now() };

    if (userId && db) {
      setMessage(`Logging "${analyzedFood.name}"...`);
      try {
        await addDoc(
          collection(db, 'artifacts', appId, 'users', userId, 'foodLog'),
          foodToLog,
        );
        setMessage(`"${analyzedFood.name}" added as ${mealType}!`);
        setFoodItem('');
        setAnalyzedFood(null);
        setTimeout(() => {
          setMessage('');
          setScreen('Home');
        }, 1500);
      } catch {
        setMessage('Error logging item. Please try again.');
      }
    } else {
      setMessage('Error: Not logged in.');
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header title="Add Other Item" onBack={() => setScreen('Home')} />
      <ScrollView style={styles.content}>
        {isLoading && (
          <View style={styles.centeredContent}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
            <Text style={[styles.description, { marginTop: 20 }]}>
              Analyzing food...
            </Text>
          </View>
        )}

        {!isLoading && !analyzedFood && (
          <>
            <Text style={styles.description}>
              Log items not found in 'Add Common Item'. Nutritional values will
              be estimated by AI.
            </Text>
            <Text style={styles.sectionTitle}>What did you eat?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Homemade Chicken Curry"
              placeholderTextColor={theme.textLight}
              value={foodItem}
              onChangeText={setFoodItem}
            />
            {message ? (
              <Text
                style={
                  message.includes('added')
                    ? styles.successMessage
                    : styles.errorMessage
                }
              >
                {message}
              </Text>
            ) : null}
            <CustomButton
              title="Analyze Item"
              onPress={handleAnalyzeItem}
              style={{ marginTop: 10 }}
            />
            <Text
              style={{
                fontSize: 12,
                marginTop: 15,
                textAlign: 'center',
                color: theme.textLight,
              }}
            >
              Tip: Be specific (e.g., "Homemade Chicken Curry" instead of just
              "Curry").
            </Text>
          </>
        )}

        {!isLoading && analyzedFood && (
          <>
            <Text style={styles.sectionTitle}>
              AI Estimate for: {analyzedFood.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 15,
                color: theme.textLight,
              }}
            >
              Here's an estimate for a typical serving. Add to log if it looks
              correct.
            </Text>
            <View style={styles.card}>
              <View style={styles.nutritionGrid}>
                {[
                  ['Est. Calories', `${analyzedFood.calories} cal`],
                  ['Est. Protein', `${analyzedFood.protein} g`],
                  ['Est. Carbs', `${analyzedFood.carbohydrates} g`],
                  ['Est. Sugar', `${analyzedFood.sugar} g`],
                  ['Est. Fat', `${analyzedFood.fat} g`],
                  ['Health Rating', `${analyzedFood.rating}/10`],
                ].map(([label, value]) => (
                  <View key={label} style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>{label}</Text>
                    <Text style={styles.nutritionValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
            <CustomButton title="Add to Daily Log" onPress={handleAddMeal} />
            <CustomButton
              title="Cancel"
              onPress={() => {
                setAnalyzedFood(null);
                setFoodItem('');
                setMessage('');
              }}
              secondary
              style={{ marginTop: 10 }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
