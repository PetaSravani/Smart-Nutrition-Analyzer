import React from 'react';
import { SafeAreaView, ScrollView, Text, View, Alert } from 'react-native';
import RNPrint from 'react-native-print';
import { styles } from '../styles';
import { Header, CustomButton } from '../components';
import { CommonScreenProps, FoodLogItem } from '../types';

type Props = CommonScreenProps & { dailyLog: FoodLogItem[] };

export const FoodReportScreen: React.FC<Props> = ({ setScreen, dailyLog }) => {
  const totals = dailyLog.reduce(
    (acc, item) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.fat += item.fat || 0;
      acc.carbs += item.carbohydrates || 0;
      acc.sugar += item.sugar || 0;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 },
  );

  const sortedDailyLog = [...dailyLog].sort(
    (a, b) =>
      new Date(a.date as string).getTime() -
      new Date(b.date as string).getTime(),
  );

  const generateReportHTML = () => {
    const css = `<style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; }
      h1 { color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 5px; }
      h2 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 3px; }
      .summary { background-color: #f9f9f9; padding: 15px; border-radius: 8px; }
      .summary p { margin: 5px 0; font-size: 16px; }
      .item { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
      .item-header { font-size: 18px; font-weight: bold; color: #3498db; }
      .item-meta { font-size: 14px; color: #777; }
      .item-nutrition { margin-top: 10px; }
      .item-nutrition span { display: block; margin-left: 10px; }
    </style>`;

    let html = `<html><head><title>Daily Food Report</title>${css}</head><body>`;
    html += `<h1>NutriScan AI - Daily Food Report</h1><p>Date: ${new Date().toLocaleDateString()}</p>`;
    html += `<h2>Today's Summary</h2><div class="summary">`;
    html += `<p><strong>Total Items:</strong> ${dailyLog.length}</p>`;
    html += `<p><strong>Total Calories:</strong> ${totals.calories.toFixed(
      0,
    )} cal</p>`;
    html += `<p><strong>Total Protein:</strong> ${totals.protein.toFixed(
      1,
    )} g</p>`;
    html += `<p><strong>Total Fat:</strong> ${totals.fat.toFixed(1)} g</p>`;
    html += `<p><strong>Total Carbs:</strong> ${totals.carbs.toFixed(1)} g</p>`;
    html += `<p><strong>Total Sugar:</strong> ${totals.sugar.toFixed(
      1,
    )} g</p></div>`;
    html += `<h2>Logged Items</h2>`;

    sortedDailyLog.forEach(item => {
      const time = new Date(item.date as string).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      html += `<div class="item">`;
      html += `<div class="item-header">${item.name}</div>`;
      html += `<div class="item-meta">Time: ${item.mealType} at ${time}</div>`;
      html += `<div class="item-nutrition">`;
      html += `<span><strong>Calories:</strong> ${item.calories.toFixed(
        0,
      )} cal</span>`;
      html += `<span><strong>Protein:</strong> ${item.protein.toFixed(
        1,
      )} g</span>`;
      if (item.fat > 0 || item.carbohydrates > 0) {
        html += `<span><strong>Fat:</strong> ${item.fat.toFixed(1)} g</span>`;
        html += `<span><strong>Carbs:</strong> ${item.carbohydrates.toFixed(
          1,
        )} g</span>`;
        html += `<span><strong>Sugar:</strong> ${item.sugar.toFixed(
          1,
        )} g</span>`;
      }
      if (item.vitamins?.length)
        html += `<span><strong>Vitamins:</strong> ${item.vitamins.join(
          ', ',
        )}</span>`;
      if (item.minerals?.length)
        html += `<span><strong>Minerals:</strong> ${item.minerals.join(
          ', ',
        )}</span>`;
      html += `</div></div>`;
    });

    html += `</body></html>`;
    return html;
  };

  const handleDownload = async () => {
    if (dailyLog.length === 0) {
      Alert.alert(
        'No Data',
        'There is no data to generate a report for today.',
      );
      return;
    }
    try {
      await RNPrint.print({
        html: generateReportHTML(),
        fileName: `NutriScan-Report-${new Date().toISOString().split('T')[0]}`,
        jobName: 'NutriScan Daily Report',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Could not generate PDF. ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header title="Daily Food Report" onBack={() => setScreen('Home')} />
      <ScrollView style={styles.content}>
        {dailyLog.length === 0 ? (
          <Text style={styles.centeredText}>No food logged yet today.</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <View style={styles.card}>
              <View style={styles.nutritionGrid}>
                {[
                  ['Total Items', String(dailyLog.length)],
                  ['Total Calories', `${totals.calories.toFixed(0)} cal`],
                  ['Total Protein', `${totals.protein.toFixed(1)} g`],
                  ['Total Fat', `${totals.fat.toFixed(1)} g`],
                  ['Total Carbs', `${totals.carbs.toFixed(1)} g`],
                  ['Total Sugar', `${totals.sugar.toFixed(1)} g`],
                ].map(([label, value]) => (
                  <View key={label} style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>{label}</Text>
                    <Text style={styles.nutritionValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Logged Items</Text>
            {sortedDailyLog.map((item, index) => (
              <View style={styles.card} key={item.id || index}>
                <Text style={styles.logItemName}>{item.name}</Text>
                <Text style={styles.logItemTime}>
                  {item.mealType} at{' '}
                  {new Date(item.date as string).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <View style={[styles.nutritionGrid, { marginTop: 10 }]}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>
                      {item.calories.toFixed(0)} cal
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>
                      {item.protein.toFixed(1)} g
                    </Text>
                  </View>
                  {(item.fat > 0 || item.carbohydrates > 0) && (
                    <>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                        <Text style={styles.nutritionValue}>
                          {item.fat.toFixed(1)} g
                        </Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                        <Text style={styles.nutritionValue}>
                          {item.carbohydrates.toFixed(1)} g
                        </Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionLabel}>Sugar</Text>
                        <Text style={styles.nutritionValue}>
                          {item.sugar.toFixed(1)} g
                        </Text>
                      </View>
                    </>
                  )}
                  {item.vitamins?.length > 0 && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Vitamins</Text>
                      <Text style={styles.nutritionValue}>
                        {item.vitamins.join(', ')}
                      </Text>
                    </View>
                  )}
                  {item.minerals?.length > 0 && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Minerals</Text>
                      <Text style={styles.nutritionValue}>
                        {item.minerals.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            <CustomButton
              title="Generate PDF Report"
              onPress={handleDownload}
              style={{ marginTop: 10, marginBottom: 40 }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
