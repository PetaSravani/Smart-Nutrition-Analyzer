import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton, BottomNav } from '../components';
import { FULL_FOOD_DATABASE } from '../data/foodDatabase';
import { CommonScreenProps, FoodLogItem } from '../types';

type Props = CommonScreenProps & {
  dailyLog: FoodLogItem[];
  fullLog: FoodLogItem[];
};

export const ReportsScreen: React.FC<Props> = ({
  setScreen,
  dailyLog,
  fullLog,
  userPrefs,
}) => {
  const [activeTab, setActiveTab] = useState('Daily');
  const chartWidth = Dimensions.get('window').width - 40;

  // Build a food→nutrient lookup for gap analysis
  const combinedFoodDb = FULL_FOOD_DATABASE.reduce((acc: any, item: any) => {
    acc[item.name] = {
      vitamins: item.nutritions?.vitamins || [],
      minerals: item.nutritions?.minerals || [],
    };
    return acc;
  }, {});

  const getDailyChartData = () => {
    if (!dailyLog?.length) return null;
    const sorted = [...dailyLog].sort(
      (a, b) =>
        new Date(a.date as string).getTime() -
        new Date(b.date as string).getTime(),
    );
    let cumCal = 0;
    const chartData = sorted.map(item => {
      cumCal += item.calories || 0;
      return { time: new Date(item.date as string), calories: cumCal };
    });
    return {
      labels: chartData.map(d =>
        d.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ),
      datasets: [
        {
          data: chartData.map(d => d.calories),
          color: (o = 1) => `rgba(46,204,113,${o})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Cumulative Calories Today'],
    };
  };

  const getWeeklyChartData = () => {
    if (!fullLog?.length) return null;
    const last7 = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      })
      .reverse();
    const weeklyData = last7.map(dateStr => {
      const s = new Date(dateStr + 'T00:00:00'),
        e = new Date(dateStr + 'T23:59:59.999');
      const dayLog = (fullLog || []).filter(item => {
        try {
          const d = new Date(item.date as string);
          return d >= s && d <= e;
        } catch {
          return false;
        }
      });
      return {
        calories: dayLog.reduce((sum, i) => sum + (i.calories || 0), 0),
      };
    });
    return {
      labels: last7.map(d =>
        new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
        }),
      ),
      datasets: [
        {
          data: weeklyData.map(d => d.calories),
          color: (o = 1) => `rgba(52,152,219,${o})`,
        },
      ],
      legend: ['Calories'],
    };
  };

  const getNutrientAnalysis = () => {
    if (!dailyLog?.length) return { missing: [], suggestions: {} };
    const TARGET_VITAMINS = [
      'A',
      'B1',
      'B6',
      'B12',
      'C',
      'K',
      'D',
      'E',
      'Folate',
      'Niacin',
    ];
    const TARGET_MINERALS = [
      'Calcium',
      'Iron',
      'Magnesium',
      'Potassium',
      'Selenium',
      'Phosphorus',
      'Manganese',
    ];
    const consumedVits = new Set<string>();
    const consumedMins = new Set<string>();
    dailyLog.forEach(item => {
      (item.vitamins || []).forEach(v =>
        consumedVits.add(v.replace('Vitamin ', '').trim()),
      );
      (item.minerals || []).forEach(m => consumedMins.add(m.trim()));
    });
    const missing = [
      ...TARGET_VITAMINS.filter(v => !consumedVits.has(v)),
      ...TARGET_MINERALS.filter(m => !consumedMins.has(m)),
    ];
    const suggestions: { [key: string]: string[] } = {};
    missing.forEach(nutrient => {
      suggestions[nutrient] = [];
      for (const [food, data] of Object.entries(combinedFoodDb) as any) {
        const fv = (data.vitamins || []).map((v: string) =>
          v.replace('Vitamin ', ''),
        );
        const fm = data.minerals || [];
        if (fv.includes(nutrient) || fm.includes(nutrient)) {
          if (!suggestions[nutrient].includes(food))
            suggestions[nutrient].push(food);
        }
      }
      suggestions[nutrient] = suggestions[nutrient].slice(0, 3);
    });
    return { missing, suggestions };
  };

  const getWeeklyTotals = () => {
    if (!fullLog?.length) return { calories: 0, protein: 0 };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);
    const recent = (fullLog || []).filter(item => {
      try {
        return new Date(item.date as string) >= cutoff;
      } catch {
        return false;
      }
    });
    return {
      calories: Math.round(recent.reduce((s, i) => s + (i.calories || 0), 0)),
      protein: parseFloat(
        recent.reduce((s, i) => s + (i.protein || 0), 0).toFixed(1),
      ),
    };
  };

  const nutrientAnalysis = getNutrientAnalysis();
  const weeklyTotals = getWeeklyTotals();
  const dailyChartData = getDailyChartData();
  const weeklyChartData = getWeeklyChartData();

  const chartConfig = {
    backgroundColor: theme.backgroundWhite,
    backgroundGradientFrom: theme.backgroundWhite,
    backgroundGradientTo: theme.backgroundWhite,
    decimalPlaces: 0,
    color: (o = 1) => `rgba(46,204,113,${o})`,
    labelColor: (o = 1) => `rgba(44,62,80,${o})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: theme.primaryDark },
  };
  const barChartConfig = {
    ...chartConfig,
    color: (o = 1) => `rgba(52,152,219,${o})`,
  };

  return (
    <SafeAreaView style={styles.screenContainerWithNav}>
      <Header title="Reports" />
      <ScrollView style={styles.content}>
        <View style={styles.tabContainer}>
          {['Daily', 'Weekly'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === 'Daily' ? 'Today' : 'Weekly'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <CustomButton
          title="View Full Log History"
          onPress={() => setScreen('LogHistory')}
          secondary
          style={{ marginBottom: 20 }}
        />

        {activeTab === 'Daily' && (
          <View>
            <Text style={styles.sectionTitle}>Today's Intake Trend</Text>
            <View style={styles.card}>
              {dailyChartData ? (
                <LineChart
                  data={dailyChartData}
                  width={chartWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={{ borderRadius: 16, paddingRight: 35 }}
                  onDataPointClick={({ value, index }) =>
                    Alert.alert(
                      `At ${dailyChartData.labels[index]}`,
                      `Total Calories: ${value.toFixed(0)}`,
                    )
                  }
                />
              ) : (
                <Text style={[styles.centeredText, { marginTop: 10 }]}>
                  Log food items to see today's trend.
                </Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Today's Nutrient Feedback</Text>
            <View style={styles.card}>
              {nutrientAnalysis.missing.length > 0 ? (
                <View>
                  <Text
                    style={[
                      styles.description,
                      { textAlign: 'left', marginBottom: 15 },
                    ]}
                  >
                    Based on today's log, you might consider adding sources of:
                  </Text>
                  {Object.entries(nutrientAnalysis.suggestions).map(
                    ([nutrient, foods]) =>
                      foods.length > 0 ? (
                        <View key={nutrient} style={{ marginBottom: 10 }}>
                          <Text
                            style={{ fontWeight: '600', color: theme.textDark }}
                          >
                            • {nutrient}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: theme.textLight,
                              paddingLeft: 15,
                            }}
                          >
                            Try adding: {foods.join(', ')}
                          </Text>
                        </View>
                      ) : null,
                  )}
                </View>
              ) : dailyLog?.length > 0 ? (
                <Text style={styles.centeredText}>
                  Great job! Your diet seems well-balanced today.
                </Text>
              ) : (
                <Text style={styles.centeredText}>
                  Log food items to get nutrient feedback.
                </Text>
              )}
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 15,
                  textAlign: 'center',
                  color: theme.textLight,
                }}
              >
                Note: Vitamin/mineral data may be limited for manually added or
                scanned items.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'Weekly' && (
          <View>
            <Text style={styles.sectionTitle}>Last 7 Days Trend</Text>
            <View style={styles.card}>
              {weeklyChartData ? (
                <BarChart
                  data={weeklyChartData}
                  width={chartWidth}
                  height={220}
                  chartConfig={barChartConfig}
                  yAxisLabel=""
                  yAxisSuffix=" cal"
                  verticalLabelRotation={0}
                  style={{ borderRadius: 16, paddingRight: 35 }}
                  fromZero
                  showValuesOnTopOfBars
                  onDataPointClick={({ value, index }) =>
                    Alert.alert(
                      `On ${weeklyChartData.labels[index]}`,
                      `Total Calories: ${value.toFixed(0)}`,
                    )
                  }
                />
              ) : (
                <Text style={[styles.centeredText, { marginTop: 10 }]}>
                  Log some data to see weekly trends.
                </Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Weekly Total vs. Goal</Text>
            <View style={styles.card}>
              <View style={styles.nutritionGrid}>
                <View style={styles.weeklyTotalHeader}>
                  <Text style={styles.weeklyTotalHeaderText}>Nutrient</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {['Total', 'Target'].map(h => (
                      <Text
                        key={h}
                        style={[
                          styles.weeklyTotalHeaderText,
                          { width: 80, textAlign: 'right' },
                        ]}
                      >
                        {h}
                      </Text>
                    ))}
                  </View>
                </View>
                {[
                  {
                    label: 'Calories',
                    total: weeklyTotals.calories,
                    goal: userPrefs.weeklyCalorieGoal,
                    suffix: '',
                  },
                  {
                    label: 'Protein',
                    total: weeklyTotals.protein,
                    goal: userPrefs.weeklyProteinGoal,
                    suffix: 'g',
                  },
                ].map(({ label, total, goal, suffix }) => (
                  <View key={label} style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>{label}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Text
                        style={[
                          styles.nutritionValue,
                          { width: 80, textAlign: 'right' },
                          goal && total > goal && styles.metricValueWarning,
                        ]}
                      >
                        {total}
                        {suffix}
                      </Text>
                      <Text
                        style={[
                          styles.nutritionValue,
                          { width: 80, textAlign: 'right' },
                        ]}
                      >
                        {goal ? `${goal}${suffix}` : 'N/A'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              {!userPrefs.weeklyCalorieGoal && !userPrefs.weeklyProteinGoal && (
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 15,
                    textAlign: 'center',
                    color: theme.textLight,
                  }}
                >
                  Set weekly goals in Settings to compare.
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <BottomNav setScreen={setScreen} activeScreen="Reports" />
    </SafeAreaView>
  );
};
