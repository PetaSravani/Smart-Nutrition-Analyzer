import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  Switch,
  Modal,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton } from '../components';
import { getMealTypeByTime } from '../utils/helpers';
import {
  CommonScreenProps,
  ScannedItem,
  AllergyLogItem,
  FoodLogItem,
} from '../types';

type Props = CommonScreenProps & {
  scannedItem: ScannedItem | null;
  addAllergy: (item: Omit<AllergyLogItem, 'id' | 'date'>) => void;
};

export const AnalysisScreen: React.FC<Props> = ({
  setScreen,
  scannedItem,
  userId,
  db,
  appId,
}) => {
  if (!scannedItem || scannedItem.error) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <Header title="Error" onBack={() => setScreen('Scan')} />
        <View style={styles.contentScrollableCenter}>
          <Text style={styles.errorMessage}>
            {scannedItem?.error || 'An error occurred.'}
          </Text>
          <CustomButton title="Try Again" onPress={() => setScreen('Scan')} />
        </View>
      </SafeAreaView>
    );
  }

  const [packageWeight, setPackageWeight] = useState('');
  const [isPer100gMode, setIsPer100gMode] = useState(
    scannedItem?.isPer100g || false,
  );
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [symptoms, setSymptoms] = useState('');

  useEffect(() => {
    setPackageWeight(scannedItem?.packageWeightGrams?.toString() || '');
    setIsPer100gMode(scannedItem?.isPer100g || false);
  }, [scannedItem]);

  const parseNutrient = (value: string | null) => {
    if (typeof value !== 'string') return { value: 0, unit: '' };
    const numericPart = value.match(/(\d*\.?\d+)/);
    const unitPart = value.match(/([a-zA-Z]+)/);
    return {
      value: numericPart ? parseFloat(numericPart[0]) : 0,
      unit: unitPart ? unitPart[0] : '',
    };
  };

  const canCalculateTotal =
    isPer100gMode && packageWeight && !isNaN(parseFloat(packageWeight));

  const handleAteIt = async () => {
    const mealType = getMealTypeByTime();
    let foodToLog: Omit<FoodLogItem, 'id'> = {
      name: scannedItem.name || 'Unknown Scanned Item',
      calories: scannedItem.calories || 0,
      protein: scannedItem.protein || 0,
      fat: scannedItem.nutritionFacts?.totalFat
        ? parseNutrient(scannedItem.nutritionFacts.totalFat).value
        : 0,
      carbohydrates: scannedItem.nutritionFacts?.carbohydrates
        ? parseNutrient(scannedItem.nutritionFacts.carbohydrates).value
        : 0,
      sugar: scannedItem.nutritionFacts?.sugars
        ? parseNutrient(scannedItem.nutritionFacts.sugars).value
        : 0,
      vitamins: scannedItem.vitamins || [],
      minerals: scannedItem.minerals || [],
      mealType,
      rating: scannedItem.rating || 5,
      date: Timestamp.now(),
    };

    if (canCalculateTotal) {
      const multiplier = parseFloat(packageWeight) / 100;
      foodToLog.calories =
        (parseNutrient(scannedItem.nutritionFacts.calories).value || 0) *
        multiplier;
      foodToLog.protein =
        (parseNutrient(scannedItem.nutritionFacts.protein).value || 0) *
        multiplier;
      foodToLog.fat =
        (parseNutrient(scannedItem.nutritionFacts.totalFat).value || 0) *
        multiplier;
      foodToLog.carbohydrates =
        (parseNutrient(scannedItem.nutritionFacts.carbohydrates).value || 0) *
        multiplier;
      foodToLog.sugar =
        (parseNutrient(scannedItem.nutritionFacts.sugars).value || 0) *
        multiplier;
    }

    if (userId && db) {
      try {
        await addDoc(
          collection(db, 'artifacts', appId, 'users', userId, 'foodLog'),
          foodToLog,
        );
      } catch (e) {
        Alert.alert('Error', 'Could not save food log. Please try again.');
        return;
      }
    } else {
      Alert.alert('Error', 'You must be logged in to save data.');
      return;
    }
    setAllergyModalVisible(true);
  };

  const handleAllergyLog = async () => {
    if (symptoms && userId && db) {
      try {
        await addDoc(
          collection(db, 'artifacts', appId, 'users', userId, 'allergyLog'),
          {
            food: scannedItem.name || 'Unknown Scanned Item',
            symptoms,
            date: Timestamp.now(),
          },
        );
      } catch (e) {
        Alert.alert('Error', 'Could not save allergy log.');
      }
    }
    setAllergyModalVisible(false);
    setScreen('Home');
  };

  const getRatingColor = (rating: number | undefined) => {
    if (rating === undefined) return '#95a5a6';
    if (rating > 7) return theme.successColor;
    if (rating > 4) return theme.warningColor;
    return theme.errorColor;
  };

  const isExpired =
    scannedItem.expiryDate && new Date(scannedItem.expiryDate) < new Date();
  const productInfoExists =
    scannedItem.manufacturingDate ||
    scannedItem.expiryDate ||
    (scannedItem.warningsAndNotes && scannedItem.warningsAndNotes.length > 0);
  const needsWeightInput = isPer100gMode && !scannedItem.packageWeightGrams;

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header title="Analysis" onBack={() => setScreen('Scan')} />
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { marginTop: 0 }]}>
          {scannedItem.name || 'Product'}
        </Text>

        {isExpired && (
          <View style={[styles.card, styles.warningCard]}>
            <Text style={styles.warningCardTitle}>⚠️ Expired Product</Text>
            <Text style={[styles.description, { textAlign: 'left' }]}>
              This product appears to be past its expiration date (
              {scannedItem.expiryDate}). Do not consume.
            </Text>
          </View>
        )}

        <View
          style={[
            styles.ratingCircle,
            { backgroundColor: getRatingColor(scannedItem.rating) },
          ]}
        >
          <Text style={styles.ratingText}>
            {scannedItem.rating?.toFixed(1) || '?'}
          </Text>
          <Text style={styles.ratingSubtext}>/ 10</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <Text style={[styles.description, { textAlign: 'left' }]}>
            {scannedItem.recommendation}
          </Text>
        </View>

        {productInfoExists && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.nutritionGrid}>
              {scannedItem.manufacturingDate && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Manufactured On</Text>
                  <Text style={styles.nutritionValue}>
                    {scannedItem.manufacturingDate}
                  </Text>
                </View>
              )}
              {scannedItem.expiryDate && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Best Before</Text>
                  <Text style={styles.nutritionValue}>
                    {scannedItem.expiryDate}
                  </Text>
                </View>
              )}
              {scannedItem.warningsAndNotes?.length > 0 && (
                <View style={styles.nutritionItemFull}>
                  <Text style={[styles.nutritionLabel, { marginBottom: 8 }]}>
                    Warnings & Notes
                  </Text>
                  <View style={styles.warningsList}>
                    {scannedItem.warningsAndNotes.map((note, i) => (
                      <Text key={i} style={styles.warningsListItem}>
                        • {note}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {scannedItem.nutritionFacts && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <View style={styles.nutritionGrid}>
              {Object.entries(scannedItem.nutritionFacts).map(([key, value]) =>
                value ? (
                  <View key={key} style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, s => s.toUpperCase())}
                    </Text>
                    <Text style={styles.nutritionValue}>{value}</Text>
                  </View>
                ) : null,
              )}
            </View>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Values are per 100g</Text>
              <Switch
                trackColor={{ false: '#767577', true: theme.primaryColor }}
                thumbColor="#f4f3f4"
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsPer100gMode(!isPer100gMode)}
                value={isPer100gMode}
              />
            </View>
          </View>
        )}

        {(needsWeightInput || (isPer100gMode && !needsWeightInput)) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Calculate Total Nutrition</Text>
            <Text
              style={[
                styles.description,
                { textAlign: 'left', marginBottom: 15 },
              ]}
            >
              Enter the total package weight to see values for the whole
              package.
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="Enter total weight in grams (e.g., 250)"
              placeholderTextColor={theme.textLight}
              value={packageWeight}
              onChangeText={setPackageWeight}
            />
          </View>
        )}

        {canCalculateTotal && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Nutrition for Full Package ({packageWeight}g)
            </Text>
            <View style={styles.nutritionGrid}>
              {Object.entries(scannedItem.nutritionFacts).map(
                ([key, value]) => {
                  if (!value || key === 'servingSize') return null;
                  const nutrient = parseNutrient(value);
                  const totalValue =
                    (nutrient.value / 100) * parseFloat(packageWeight);
                  return (
                    <View key={key} style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, s => s.toUpperCase())}
                      </Text>
                      <Text style={styles.nutritionValue}>
                        {totalValue.toFixed(1)}
                        {nutrient.unit}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
          </View>
        )}

        {scannedItem.ingredientsAnalysis?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Key Ingredient Analysis</Text>
            {scannedItem.ingredientsAnalysis.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View
                  style={[
                    styles.indicator,
                    ing.health_impact === 'good' && styles.indicator_good,
                    ing.health_impact === 'neutral' && styles.indicator_neutral,
                    ing.health_impact === 'bad' && styles.indicator_bad,
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientAnalysis}>{ing.analysis}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {scannedItem.fullIngredientList?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>All Ingredients</Text>
            <Text style={styles.ingredientListText}>
              {scannedItem.fullIngredientList.join(', ')}
            </Text>
          </View>
        )}

        {scannedItem.alternatives?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
            {scannedItem.alternatives.map((alt, i) => (
              <Text key={i} style={styles.alternativeItem}>
                • {alt}
              </Text>
            ))}
          </View>
        )}

        <CustomButton
          title="I Ate It"
          onPress={handleAteIt}
          style={{ marginVertical: 10 }}
        />
        <CustomButton
          title="Scan Another"
          onPress={() => setScreen('Scan')}
          secondary
          style={{ marginBottom: 40 }}
        />

        <Modal
          animationType="slide"
          transparent
          visible={allergyModalVisible}
          onRequestClose={() => {
            setAllergyModalVisible(false);
            setScreen('Home');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Reaction</Text>
              <Text style={styles.description}>
                Any adverse reactions after eating {scannedItem.name}?
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Itchy skin..."
                placeholderTextColor={theme.textLight}
                value={symptoms}
                onChangeText={setSymptoms}
                multiline
              />
              <CustomButton title="Save & Close" onPress={handleAllergyLog} />
              <CustomButton
                title="No Reaction"
                onPress={() => {
                  setAllergyModalVisible(false);
                  setScreen('Home');
                }}
                secondary
                style={{ marginTop: 10 }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};
