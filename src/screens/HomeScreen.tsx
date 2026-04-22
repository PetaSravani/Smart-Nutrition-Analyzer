import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';
import { Header, CustomButton, BottomNav } from '../components';
import { CommonScreenProps, FoodLogItem } from '../types';

type Props = CommonScreenProps & { dailyLog: FoodLogItem[] };

export const HomeScreen: React.FC<Props> = ({
  setScreen,
  userPrefs,
  dailyLog,
}) => {
  const totalCalories = dailyLog.reduce(
    (sum, item) => sum + (item.calories || 0),
    0,
  );
  const totalProtein = dailyLog.reduce(
    (sum, item) => sum + (item.protein || 0),
    0,
  );
  const calorieLimitExceeded =
    userPrefs.calorieGoal > 0 && totalCalories > userPrefs.calorieGoal;

  return (
    <SafeAreaView style={styles.screenContainerWithNav}>
      <Header title="Welcome Back!" />
      <ScrollView style={styles.content}>
        {calorieLimitExceeded && (
          <View style={[styles.notificationBar, styles.notificationWarning]}>
            <Text style={styles.notificationWarningText}>
              You've exceeded your daily calorie goal!
            </Text>
          </View>
        )}
        <Text style={[styles.description, { textAlign: 'left' }]}>
          Your goal today:{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {userPrefs.goal || 'Not Set'}
          </Text>
        </Text>
        <View style={styles.dashboard}>
          <View style={styles.metricBox}>
            <Text
              style={[
                styles.metricValue,
                calorieLimitExceeded && styles.metricValueWarning,
              ]}
            >
              {Math.round(totalCalories)}
            </Text>
            <Text style={styles.metricLabel}>
              / {userPrefs.calorieGoal || 'N/A'} Calories
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{totalProtein.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>
              / {userPrefs.proteinGoal || 'N/A'}g Protein
            </Text>
          </View>
        </View>
        <View style={styles.mainActions}>
          <CustomButton
            title="Scan Food Label"
            onPress={() => setScreen('Scan')}
            style={styles.scanButton}
            icon="📷"
          />
          <CustomButton
            title="Add Common Item"
            onPress={() => setScreen('LogCommonItem')}
            secondary
            icon="🍎🥕"
          />
          <CustomButton
            title="Add Other Item"
            onPress={() => setScreen('ManualEntry')}
            secondary
            icon="✍️"
          />
        </View>
      </ScrollView>
      <BottomNav setScreen={setScreen} activeScreen="Home" />
    </SafeAreaView>
  );
};
