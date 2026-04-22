import { UserPrefs, HealthHistory } from '../types';

export const getMealTypeByTime = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  if (hour >= 16 && hour < 21) return 'Dinner';
  return 'Snack';
};

export const extractNutrients = (nutrientsList: any[] = [], unitAdjust = 1) => {
  const getVal = (name: string) => {
    const nutrient = nutrientsList?.find(n => n.nutrientName === name);
    return nutrient && nutrient.value !== null && !isNaN(nutrient.value)
      ? nutrient.value * unitAdjust
      : 0;
  };
  const getVit = (name: string) =>
    nutrientsList?.some(
      n => n.nutrientName === name && n.value !== null && n.value > 0,
    );
  const getMin = (name: string) =>
    nutrientsList?.some(
      n => n.nutrientName === name && n.value !== null && n.value > 0,
    );

  let vitamins: string[] = [];
  if (getVit('Vitamin C, total ascorbic acid')) vitamins.push('C');
  if (getVit('Vitamin A, RAE')) vitamins.push('A');
  if (getVit('Thiamin')) vitamins.push('B1');
  if (getVit('Riboflavin')) vitamins.push('B2');
  if (getVit('Niacin')) vitamins.push('B3');
  if (getVit('Vitamin B-6')) vitamins.push('B6');
  if (getVit('Vitamin B-12')) vitamins.push('B12');
  if (getVit('Folate, total')) vitamins.push('Folate');
  if (getVit('Vitamin E (alpha-tocopherol)')) vitamins.push('E');
  if (getVit('Vitamin K (phylloquinone)')) vitamins.push('K');
  if (getVit('Vitamin D (D2 + D3)')) vitamins.push('D');

  let minerals: string[] = [];
  if (getMin('Calcium, Ca')) minerals.push('Calcium');
  if (getMin('Iron, Fe')) minerals.push('Iron');
  if (getMin('Magnesium, Mg')) minerals.push('Magnesium');
  if (getMin('Potassium, K')) minerals.push('Potassium');
  if (getMin('Zinc, Zn')) vitamins.push('Zinc');
  if (getMin('Copper, Cu')) minerals.push('Copper');
  if (getMin('Manganese, Mn')) minerals.push('Manganese');
  if (getMin('Selenium, Se')) minerals.push('Selenium');
  if (getMin('Phosphorus, P')) minerals.push('Phosphorus');

  let energyEntry = nutrientsList?.find(n => n.nutrientName === 'Energy');
  let calories = 0;
  if (energyEntry && energyEntry.value !== null && !isNaN(energyEntry.value)) {
    if (energyEntry.unitName === 'kcal') {
      calories = energyEntry.value * unitAdjust;
    } else if (energyEntry.unitName === 'kJ') {
      calories = (energyEntry.value / 4.184) * unitAdjust;
    }
  }
  if (calories === 0) {
    calories =
      (getVal('Carbohydrate, by difference') * 4 +
        getVal('Protein') * 4 +
        getVal('Total lipid (fat)') * 9) *
      unitAdjust;
  }

  return {
    calories: Math.round(calories) || 0,
    protein: parseFloat(getVal('Protein').toFixed(1)) || 0,
    fat: parseFloat(getVal('Total lipid (fat)').toFixed(1)) || 0,
    carbohydrates:
      parseFloat(getVal('Carbohydrate, by difference').toFixed(1)) || 0,
    sugar:
      parseFloat(
        (
          nutrientsList?.find(n => n.nutrientName === 'Sugars, Total')?.value ||
          nutrientsList?.find(
            n => n.nutrientName === 'Sugars, total including NLEA',
          )?.value ||
          0
        ).toFixed(1),
      ) || 0,
    vitamins: [...new Set(vitamins)] as string[],
    minerals: [...new Set(minerals)] as string[],
  };
};

export const calculateRating = (
  item: any,
  prefs: UserPrefs,
  history: HealthHistory,
): { rating: number; justification: string } => {
  let rating = item.baseRating || 6;
  const justifications: string[] = [];
  const nutritions = item.nutritions || {};
  const nameLower = item.name.toLowerCase();

  // 1. Check Dislikes/Allergies (strongest factor)
  const dislikeList = (prefs.dislikes || '')
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
  if (
    dislikeList.some(
      (dislike: string) => nameLower.includes(dislike) && dislike.length > 2,
    )
  ) {
    return { rating: 1, justification: 'Matches your dislikes/allergies.' };
  }

  // 2. Check Health Conditions
  const conditions = history.conditions || [];
  if (conditions.includes('Diabetes') && nutritions.sugar > 15) {
    rating -= 3;
    justifications.push('High sugar');
  }
  if (conditions.includes('High Blood Pressure')) {
    if (nutritions.fat > 20) {
      rating -= 2;
      justifications.push('High fat');
    }
    if (nutritions.sugar > 15) {
      rating -= 2;
      justifications.push('High sugar');
    }
  }
  if (conditions.includes('Heart Condition') && nutritions.fat > 20) {
    if (
      nameLower.includes('salmon') ||
      nameLower.includes('almond') ||
      nameLower.includes('walnut') ||
      nameLower.includes('avocado')
    ) {
      rating += 1;
      justifications.push('Good fats');
    } else {
      rating -= 3;
      justifications.push('High fat');
    }
  }

  // 3. Check Goals
  const goal = prefs.goal;
  if (goal === 'Weight Loss' && nutritions.calories > 300) {
    rating -= 2;
    justifications.push('High calories');
  }
  if (goal === 'Weight Gain' && nutritions.calories > 300) {
    rating += 2;
    justifications.push('Calorie-dense');
  } else if (goal === 'Weight Gain' && nutritions.calories < 100) {
    rating -= 2;
    justifications.push('Low calories');
  }
  if (goal === 'Fitness' && nutritions.protein > 15) {
    rating += 2;
    justifications.push('High protein');
  } else if (goal === 'Fitness' && nutritions.protein < 5) {
    rating -= 1;
    justifications.push('Low protein');
  }

  const finalRating = Math.max(1, Math.min(10, Math.round(rating)));
  const finalJustification =
    justifications.length > 0
      ? justifications.join(', ')
      : finalRating >= 7
      ? 'Good choice!'
      : 'Okay choice.';

  return { rating: finalRating, justification: finalJustification };
};
