import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header } from '../components';
import { CommonScreenProps, FoodLogItem } from '../types';

type Props = CommonScreenProps & { fullLog: FoodLogItem[] };

export const LogHistoryScreen: React.FC<Props> = ({ setScreen, fullLog }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLog = (fullLog || [])
    .filter(item => item.date && new Date(item.date as string) >= sevenDaysAgo)
    .sort(
      (a, b) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime(),
    );

  const groupedLog = recentLog.reduce(
    (acc: { [key: string]: FoodLogItem[] }, item) => {
      const dateKey = new Date(item.date as string).toLocaleDateString(
        'en-US',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      );
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    },
    {},
  );

  const getRatingColorStyle = (rating: number | undefined) => {
    if (rating === undefined)
      return { borderLeftColor: '#bdc3c7', borderLeftWidth: 5 };
    if (rating > 7)
      return { borderLeftColor: theme.successColor, borderLeftWidth: 5 };
    if (rating >= 5)
      return { borderLeftColor: theme.warningColor, borderLeftWidth: 5 };
    return { borderLeftColor: theme.errorColor, borderLeftWidth: 5 };
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header
        title="Log History (7 Days)"
        onBack={() => setScreen('Reports')}
      />
      <ScrollView style={styles.content}>
        {Object.keys(groupedLog).length === 0 ? (
          <Text style={styles.centeredText}>
            No food logged in the last 7 days.
          </Text>
        ) : (
          Object.entries(groupedLog).map(([date, items]) => (
            <View key={date}>
              <Text style={styles.sectionTitle}>{date}</Text>
              {items.map((item, index) => {
                const itemDate = new Date(item.date as string);
                const itemId = `${date}-${index}`;
                const isExpanded = expandedItem === itemId;
                return (
                  <View
                    key={item.id || index}
                    style={[styles.logItem, getRatingColorStyle(item.rating)]}
                  >
                    <TouchableOpacity
                      style={styles.logItemHeader}
                      onPress={() =>
                        setExpandedItem(isExpanded ? null : itemId)
                      }
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logItemName}>{item.name}</Text>
                        <Text style={styles.logItemTime}>
                          {item.mealType} at{' '}
                          {itemDate.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.logItemCalories}>
                        {Math.round(item.calories)} cal
                      </Text>
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.logItemDetails}>
                        <View style={styles.nutritionGrid}>
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Protein</Text>
                            <Text style={styles.nutritionValue}>
                              {item.protein?.toFixed(1)}g
                            </Text>
                          </View>
                          {item.rating !== undefined && (
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Rating</Text>
                              <Text style={styles.nutritionValue}>
                                {item.rating}/10
                              </Text>
                            </View>
                          )}
                          {item.vitamins?.length > 0 && (
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>
                                Vitamins
                              </Text>
                              <Text
                                style={[
                                  styles.nutritionValue,
                                  { flex: 1, textAlign: 'right' },
                                ]}
                              >
                                {item.vitamins.join(', ')}
                              </Text>
                            </View>
                          )}
                          {item.minerals?.length > 0 && (
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>
                                Minerals
                              </Text>
                              <Text
                                style={[
                                  styles.nutritionValue,
                                  { flex: 1, textAlign: 'right' },
                                ]}
                              >
                                {item.minerals.join(', ')}
                              </Text>
                            </View>
                          )}
                          {item.fat !== undefined && (
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Fat</Text>
                              <Text style={styles.nutritionValue}>
                                {item.fat?.toFixed(1)}g
                              </Text>
                            </View>
                          )}
                          {item.sugar !== undefined && (
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Sugar</Text>
                              <Text style={styles.nutritionValue}>
                                {item.sugar?.toFixed(1)}g
                              </Text>
                            </View>
                          )}
                          {item.carbohydrates !== undefined && (
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Carbs</Text>
                              <Text style={styles.nutritionValue}>
                                {item.carbohydrates?.toFixed(1)}g
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
