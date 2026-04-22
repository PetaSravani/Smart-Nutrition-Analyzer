import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton } from '../components';
import { calculateRating, getMealTypeByTime } from '../utils/helpers';
import { FULL_FOOD_DATABASE } from '../data/foodDatabase';
import { CommonScreenProps, HealthHistory, FoodLogItem } from '../types';

type Props = CommonScreenProps & { healthHistory: HealthHistory };

export const LogCommonItemScreen: React.FC<Props> = ({
  setScreen,
  userPrefs,
  healthHistory,
  userId,
  db,
  appId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: { data: any; quantity: number };
  }>({});
  const [message, setMessage] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const results = FULL_FOOD_DATABASE.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedItems[item.id],
      ).map(item => {
        const { rating, justification } = calculateRating(
          item,
          userPrefs,
          healthHistory,
        );
        return { ...item, personalizedRating: rating, justification };
      });
      setSearchResults(results.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, selectedItems, userPrefs, healthHistory]);

  const handleSelectItem = (item: any) => {
    setSelectedItems(prev => ({
      ...prev,
      [item.id]: {
        data: item,
        quantity: item.type === 'fruit' && !item.isPer100g ? 1 : 100,
      },
    }));
    setSearchTerm('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const handleQuantityChange = (itemId: string, quantity: string) => {
    const newQuantity = parseInt(quantity) || 0;
    if (newQuantity >= 0) {
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], quantity: newQuantity },
      }));
    }
  };

  const removeSelectedItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleLogItems = async () => {
    const mealType = getMealTypeByTime();
    const itemsToLog: Omit<FoodLogItem, 'id'>[] = [];

    Object.values(selectedItems).forEach(({ data: itemData, quantity }) => {
      if (quantity > 0) {
        const multiplier = itemData.isPer100g ? quantity / 100 : quantity;
        const unitLabel = itemData.isPer100g
          ? 'g'
          : quantity === 1
          ? 'unit'
          : 'units';
        itemsToLog.push({
          name: `${itemData.name} (${quantity} ${unitLabel})`,
          calories: (itemData.nutritions?.calories || 0) * multiplier,
          protein: (itemData.nutritions?.protein || 0) * multiplier,
          fat: (itemData.nutritions?.fat || 0) * multiplier,
          sugar: (itemData.nutritions?.sugar || 0) * multiplier,
          carbohydrates: (itemData.nutritions?.carbohydrates || 0) * multiplier,
          vitamins: itemData.nutritions?.vitamins || [],
          minerals: itemData.nutritions?.minerals || [],
          mealType,
          rating: itemData.personalizedRating,
          date: Timestamp.now(),
        });
      }
    });

    if (itemsToLog.length === 0) {
      setMessage(
        'Please select at least one item and enter a quantity greater than 0.',
      );
      return;
    }
    if (!userId || !db) {
      setMessage('Error: Not logged in.');
      return;
    }

    setMessage(`Logging ${itemsToLog.length} item(s)...`);
    try {
      const logRef = collection(
        db,
        'artifacts',
        appId,
        'users',
        userId,
        'foodLog',
      );
      for (const item of itemsToLog) await addDoc(logRef, item);
      setMessage(`${itemsToLog.length} item(s) added!`);
      setSelectedItems({});
      setSearchTerm('');
      setTimeout(() => {
        setMessage('');
        setScreen('Home');
      }, 1500);
    } catch {
      setMessage('Error logging items. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header title="Log Common Item" onBack={() => setScreen('Home')} />
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.description}>
          Search for common food items (fruits, vegetables, grains, etc.),
          select them, and enter the quantity.
        </Text>

        <View style={styles.fruitVegSearchContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.input}
            placeholder="Search food items..."
            placeholderTextColor={theme.textLight}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchResults.length > 0 && (
            <View style={styles.fruitVegResultsDropdown}>
              {searchResults.map(item => (
                <TouchableOpacity
                  key={item.id || item.name}
                  style={styles.fruitVegResultItem}
                  onPress={() => handleSelectItem(item)}
                >
                  <Text style={{ color: theme.textDark }}>{item.name}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textLight,
                      marginTop: 2,
                    }}
                  >
                    {item.justification}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {Object.keys(selectedItems).length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
              Selected Items
            </Text>
            {Object.entries(selectedItems).map(
              ([itemId, { data, quantity }]) => (
                <View key={itemId} style={styles.selectedItemCard}>
                  <Text style={styles.selectedItemName}>{data.name}</Text>
                  <TextInput
                    style={styles.selectedItemQuantity}
                    keyboardType="number-pad"
                    placeholder={
                      data.type === 'fruit' && !data.isPer100g ? 'Qty' : 'grams'
                    }
                    placeholderTextColor={theme.textLight}
                    value={quantity.toString()}
                    onChangeText={text => handleQuantityChange(itemId, text)}
                  />
                  <TouchableOpacity onPress={() => removeSelectedItem(itemId)}>
                    <Text style={styles.removeItemButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ),
            )}
          </View>
        )}

        {message ? (
          <Text
            style={[
              message.includes('added')
                ? styles.successMessage
                : styles.errorMessage,
              { marginTop: 15 },
            ]}
          >
            {message}
          </Text>
        ) : null}

        <CustomButton
          title="Log Selected Items"
          onPress={handleLogItems}
          style={{ marginTop: 20, marginBottom: 40 }}
          disabled={
            Object.keys(selectedItems).length === 0 ||
            Object.values(selectedItems).every(
              f => !f.quantity || f.quantity <= 0,
            )
          }
        />
        <Text
          style={{
            fontSize: 12,
            marginTop: -20,
            marginBottom: 40,
            textAlign: 'center',
            color: theme.textLight,
          }}
        >
          Nutritional data is approximate.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
