import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RL_URL } from '@env';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton } from '../components';
import { CommonScreenProps, FoodLogItem } from '../types';

const RL_API_URL = RL_URL;

type Recommendation = {
  meal_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  micros: string[];
  serving_size: string;
  is_veg: boolean;
  meal_id: number;
  meal_type: string;
  algorithm_used: string;
};

type Props = CommonScreenProps & {
  dailyLog: FoodLogItem[];
  userId: string | null;
};

export const FoodChoicesScreen: React.FC<Props> = ({
  setScreen,
  userPrefs,
  dailyLog,
  userId,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'ucb' | 'dqn' | 'pg'>('dqn');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getCurrentState = () => {
    const hour = new Date().getHours();
    let timeNorm = 0;
    if (hour < 11) timeNorm = 0.1;
    else if (hour < 16) timeNorm = 0.4;
    else if (hour < 19) timeNorm = 0.6;
    else timeNorm = 0.9;

    const currentCals = dailyLog.reduce(
      (sum, item) => sum + (item.calories || 0),
      0,
    );
    const goalCals = userPrefs.calorieGoal || 2000;
    const userAllergies = userPrefs.dislikes || [];

    return {
      user_id: userId || 'guest_user',
      time_of_day: timeNorm,
      calorie_goal: 1.0,
      current_calories: Math.min(currentCals / goalCals, 2.0),
      is_workout_day: userPrefs.goal === 'Fitness' ? 1.0 : 0.0,
      is_veg_only: isVegOnly,
      allergies: Array.isArray(userAllergies) ? userAllergies : [],
    };
  };

  const fetchRecommendation = async () => {
    setLoading(true);
    setMessage('');
    setRecommendation(null);
    try {
      const response = await fetch(`${RL_API_URL}/recommend/${selectedAlgo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getCurrentState()),
      });
      if (!response.ok) throw new Error('Backend Error');
      const data = await response.json();
      setRecommendation(data);
    } catch (error: any) {
      setMessage('Server Error: Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (reward: number) => {
    if (!recommendation) return;
    try {
      await fetch(`${RL_API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || 'guest_user',
          algorithm: selectedAlgo,
          meal_type: recommendation.meal_type,
          meal_id: recommendation.meal_id,
          reward,
          state: getCurrentState(),
          next_state: getCurrentState(),
        }),
      });
      setMessage(
        reward > 0
          ? 'Saved! AI learned your preference.'
          : 'Got it. AI will avoid this.',
      );
      setRecommendation(null);
    } catch {
      setMessage('Feedback failed');
    }
  };

  const VegBadge = ({ isVeg }: { isVeg: boolean }) => (
    <View
      style={{
        backgroundColor: isVeg ? '#e6f4ea' : '#fce8e6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          color: isVeg ? 'green' : 'red',
          fontSize: 10,
          fontWeight: 'bold',
        }}
      >
        {isVeg ? 'VEG' : 'NON-VEG'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header
        title="Smart Food Choices (RL)"
        onBack={() => setScreen('Home')}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          AI-Powered Recommendations tailored to your history and preferences.
        </Text>

        {/* Controls */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Veg Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 15,
              paddingBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.textDark,
                }}
              >
                Vegetarian Only 🌿
              </Text>
              <Text
                style={{ fontSize: 12, color: theme.textLight, marginTop: 2 }}
              >
                {isVegOnly
                  ? 'Showing only veg foods'
                  : 'Showing both Veg & Non-Veg'}
              </Text>
            </View>
            <Switch
              value={isVegOnly}
              onValueChange={setIsVegOnly}
              trackColor={{ false: '#767577', true: theme.successColor }}
              thumbColor={isVegOnly ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Algorithm selector */}
          <Text
            style={{
              fontSize: 14,
              color: theme.textDark,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            Learning Model:
          </Text>
          <View style={styles.tabContainer}>
            {(['ucb', 'dqn', 'pg'] as const).map(algo => (
              <TouchableOpacity
                key={algo}
                onPress={() => setSelectedAlgo(algo)}
                style={[
                  styles.tab,
                  selectedAlgo === algo && styles.tabActive,
                  selectedAlgo === algo && {
                    backgroundColor: theme.primaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedAlgo === algo && { color: '#fff' },
                  ]}
                >
                  {algo.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommendation card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AI Suggestion</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.primaryColor}
              style={{ margin: 20 }}
            />
          ) : recommendation ? (
            <View>
              <View style={{ alignItems: 'center', marginBottom: 15 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.primaryColor,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {recommendation.meal_type}
                  </Text>
                  <VegBadge isVeg={recommendation.is_veg} />
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.textDark,
                    textAlign: 'center',
                    marginVertical: 5,
                  }}
                >
                  {recommendation.meal_name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.textLight,
                    fontStyle: 'italic',
                  }}
                >
                  Serving: {recommendation.serving_size}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8f9fa',
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                {[
                  ['Calories', recommendation.calories.toFixed(0)],
                  ['Protein', `${recommendation.protein.toFixed(1)}g`],
                  ['Carbs', `${recommendation.carbs.toFixed(1)}g`],
                  ['Fat', `${recommendation.fat.toFixed(1)}g`],
                ].map(([label, value]) => (
                  <View key={label} style={{ width: '48%', marginBottom: 10 }}>
                    <Text style={{ color: theme.textLight, fontSize: 12 }}>
                      {label}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>

              {recommendation.micros?.length > 0 && (
                <View style={{ marginTop: 15, paddingHorizontal: 5 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      marginBottom: 5,
                      color: theme.textDark,
                    }}
                  >
                    Key Nutrients:
                  </Text>
                  {recommendation.micros.map((m, i) => (
                    <Text
                      key={i}
                      style={{
                        fontSize: 13,
                        color: theme.textLight,
                        marginBottom: 3,
                      }}
                    >
                      • {m}
                    </Text>
                  ))}
                </View>
              )}

              <Text
                style={{
                  fontSize: 11,
                  color: theme.textLight,
                  textAlign: 'center',
                  marginTop: 10,
                  marginBottom: 15,
                }}
              >
                Algorithm: {recommendation.algorithm_used?.toUpperCase()}
              </Text>

              <View style={styles.feedbackContainer}>
                <CustomButton
                  title="👍 Like"
                  onPress={() => sendFeedback(1)}
                  style={{ flex: 1, backgroundColor: theme.successColor }}
                />
                <CustomButton
                  title="👎 Dislike"
                  onPress={() => sendFeedback(-1)}
                  style={{ flex: 1, backgroundColor: theme.errorColor }}
                />
              </View>
              <CustomButton
                title="Get Another"
                onPress={fetchRecommendation}
                secondary
                style={{ marginTop: 10 }}
              />
            </View>
          ) : (
            <CustomButton
              title="Get Recommendation"
              onPress={fetchRecommendation}
              icon="🤖"
            />
          )}

          {message ? (
            <Text
              style={{
                textAlign: 'center',
                marginTop: 15,
                color: theme.primaryDark,
                fontWeight: '600',
              }}
            >
              {message}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
