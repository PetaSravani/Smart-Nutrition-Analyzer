import { extractNutrients } from '../utils/helpers';

// ---------------------------------------------------------------------------
// Raw Fruit Database (from Fruityvice-style data)
// ---------------------------------------------------------------------------
const FRUIT_DATABASE = [
  {
    name: 'Persimmon',
    id: 52,
    nutritions: {
      calories: 81,
      fat: 0,
      sugar: 18,
      carbohydrates: 18,
      protein: 0,
    },
  },
  {
    name: 'Strawberry',
    id: 3,
    nutritions: {
      calories: 4,
      fat: 0.05,
      sugar: 0.7,
      carbohydrates: 0.7,
      protein: 0.1,
    },
  },
  {
    name: 'Banana',
    id: 1,
    nutritions: {
      calories: 105,
      fat: 0.3,
      sugar: 14,
      carbohydrates: 27,
      protein: 1.3,
    },
  },
  {
    name: 'Tomato',
    id: 5,
    nutritions: {
      calories: 22,
      fat: 0.2,
      sugar: 2.6,
      carbohydrates: 3.9,
      protein: 0.9,
    },
  },
  {
    name: 'Pear',
    id: 4,
    nutritions: {
      calories: 101,
      fat: 0.2,
      sugar: 17,
      carbohydrates: 27,
      protein: 0.6,
    },
  },
  {
    name: 'Durian',
    id: 60,
    nutritions: {
      calories: 357,
      fat: 13,
      sugar: 0,
      carbohydrates: 66,
      protein: 3.6,
    },
  },
  {
    name: 'Blackberry',
    id: 64,
    nutritions: {
      calories: 1,
      fat: 0.01,
      sugar: 0.1,
      carbohydrates: 0.2,
      protein: 0.02,
    },
  },
  {
    name: 'Lingonberry',
    id: 65,
    nutritions: {
      calories: 50,
      fat: 0.34,
      sugar: 5.74,
      carbohydrates: 11.3,
      protein: 0.75,
    },
  },
  {
    name: 'Kiwi',
    id: 66,
    nutritions: {
      calories: 42,
      fat: 0.4,
      sugar: 6,
      carbohydrates: 10,
      protein: 0.8,
    },
  },
  {
    name: 'Lychee',
    id: 67,
    nutritions: {
      calories: 6,
      fat: 0.04,
      sugar: 1.5,
      carbohydrates: 1.7,
      protein: 0.08,
    },
  },
  {
    name: 'Pineapple',
    id: 10,
    nutritions: {
      calories: 83,
      fat: 0.2,
      sugar: 16,
      carbohydrates: 22,
      protein: 0.9,
    },
  },
  {
    name: 'Fig',
    id: 68,
    nutritions: {
      calories: 37,
      fat: 0.15,
      sugar: 8,
      carbohydrates: 9.6,
      protein: 0.4,
    },
  },
  {
    name: 'Gooseberry',
    id: 69,
    nutritions: {
      calories: 44,
      fat: 0.6,
      sugar: 0,
      carbohydrates: 10,
      protein: 0.9,
    },
  },
  {
    name: 'Passionfruit',
    id: 70,
    nutritions: {
      calories: 17,
      fat: 0.1,
      sugar: 2,
      carbohydrates: 4.2,
      protein: 0.4,
    },
  },
  {
    name: 'Plum',
    id: 71,
    nutritions: {
      calories: 30,
      fat: 0.2,
      sugar: 6.5,
      carbohydrates: 7.5,
      protein: 0.5,
    },
  },
  {
    name: 'Orange',
    id: 2,
    nutritions: {
      calories: 62,
      fat: 0.2,
      sugar: 12,
      carbohydrates: 15,
      protein: 1.3,
    },
  },
  {
    name: 'GreenApple',
    id: 72,
    nutritions: {
      calories: 95,
      fat: 0.3,
      sugar: 19,
      carbohydrates: 25,
      protein: 0.5,
    },
  },
  {
    name: 'Raspberry',
    id: 23,
    nutritions: {
      calories: 1,
      fat: 0.01,
      sugar: 0.05,
      carbohydrates: 0.15,
      protein: 0.01,
    },
  },
  {
    name: 'Watermelon',
    id: 25,
    nutritions: {
      calories: 86,
      fat: 0.4,
      sugar: 17,
      carbohydrates: 21,
      protein: 1.7,
    },
  },
  {
    name: 'Lemon',
    id: 26,
    nutritions: {
      calories: 17,
      fat: 0.2,
      sugar: 1.5,
      carbohydrates: 5.4,
      protein: 0.6,
    },
  },
  {
    name: 'Mango',
    id: 27,
    nutritions: {
      calories: 202,
      fat: 1.3,
      sugar: 46,
      carbohydrates: 50,
      protein: 2.8,
    },
  },
  {
    name: 'Blueberry',
    id: 33,
    nutritions: {
      calories: 1,
      fat: 0.01,
      sugar: 0.1,
      carbohydrates: 0.15,
      protein: 0.01,
    },
  },
  {
    name: 'Apple',
    id: 6,
    nutritions: {
      calories: 95,
      fat: 0.3,
      sugar: 19,
      carbohydrates: 25,
      protein: 0.5,
    },
  },
  {
    name: 'Guava',
    id: 37,
    nutritions: {
      calories: 37,
      fat: 0.5,
      sugar: 5,
      carbohydrates: 8,
      protein: 1.4,
    },
  },
  {
    name: 'Apricot',
    id: 35,
    nutritions: {
      calories: 17,
      fat: 0.1,
      sugar: 3.2,
      carbohydrates: 3.9,
      protein: 0.5,
    },
  },
  {
    name: 'Melon',
    id: 41,
    nutritions: {
      calories: 61,
      fat: 0.3,
      sugar: 14,
      carbohydrates: 14,
      protein: 1.5,
    },
  },
  {
    name: 'Tangerine',
    id: 77,
    nutritions: {
      calories: 47,
      fat: 0.3,
      sugar: 9,
      carbohydrates: 12,
      protein: 0.7,
    },
  },
  {
    name: 'Pitahaya',
    id: 78,
    nutritions: {
      calories: 102,
      fat: 0,
      sugar: 11,
      carbohydrates: 22,
      protein: 2,
    },
  },
  {
    name: 'Lime',
    id: 44,
    nutritions: {
      calories: 20,
      fat: 0.1,
      sugar: 1.1,
      carbohydrates: 7,
      protein: 0.5,
    },
  },
  {
    name: 'Pomegranate',
    id: 79,
    nutritions: {
      calories: 234,
      fat: 3.3,
      sugar: 39,
      carbohydrates: 53,
      protein: 4.7,
    },
  },
  {
    name: 'Dragonfruit',
    id: 80,
    nutritions: {
      calories: 102,
      fat: 0,
      sugar: 11,
      carbohydrates: 22,
      protein: 2,
    },
  },
  {
    name: 'Grape',
    id: 81,
    nutritions: {
      calories: 2,
      fat: 0.01,
      sugar: 0.5,
      carbohydrates: 0.6,
      protein: 0.02,
    },
  },
  {
    name: 'Morus',
    id: 82,
    nutritions: {
      calories: 43,
      fat: 0.39,
      sugar: 8.1,
      carbohydrates: 9.8,
      protein: 1.44,
    },
  },
  {
    name: 'Feijoa',
    id: 76,
    nutritions: {
      calories: 44,
      fat: 0.4,
      sugar: 3,
      carbohydrates: 8,
      protein: 0.6,
    },
  },
  {
    name: 'Avocado',
    id: 84,
    nutritions: {
      calories: 234,
      fat: 21,
      sugar: 1,
      carbohydrates: 12,
      protein: 2.9,
    },
  },
  {
    name: 'Kiwifruit',
    id: 85,
    nutritions: {
      calories: 42,
      fat: 0.4,
      sugar: 6,
      carbohydrates: 10,
      protein: 0.8,
    },
  },
  {
    name: 'Cranberry',
    id: 87,
    nutritions: {
      calories: 46,
      fat: 0.1,
      sugar: 4,
      carbohydrates: 12.2,
      protein: 0.4,
    },
  },
  {
    name: 'Cherry',
    id: 9,
    nutritions: {
      calories: 5,
      fat: 0.03,
      sugar: 0.8,
      carbohydrates: 1.2,
      protein: 0.1,
    },
  },
  {
    name: 'Peach',
    id: 86,
    nutritions: {
      calories: 59,
      fat: 0.4,
      sugar: 13,
      carbohydrates: 14,
      protein: 1.4,
    },
  },
  {
    name: 'Jackfruit',
    id: 94,
    nutritions: {
      calories: 157,
      fat: 1.1,
      sugar: 31,
      carbohydrates: 38,
      protein: 2.8,
    },
  },
  {
    name: 'Horned Melon',
    id: 95,
    nutritions: {
      calories: 44,
      fat: 1.26,
      sugar: 0.5,
      carbohydrates: 7.56,
      protein: 1.78,
    },
  },
  {
    name: 'Hazelnut',
    id: 96,
    nutritions: {
      calories: 628,
      fat: 61,
      sugar: 4.3,
      carbohydrates: 17,
      protein: 15,
    },
  },
  {
    name: 'Pomelo',
    id: 98,
    nutritions: {
      calories: 231,
      fat: 0.2,
      sugar: 0,
      carbohydrates: 59,
      protein: 4.6,
    },
  },
  {
    name: 'Mangosteen',
    id: 99,
    nutritions: {
      calories: 81,
      fat: 0.6,
      sugar: 0,
      carbohydrates: 20,
      protein: 0.5,
    },
  },
  {
    name: 'Pumpkin',
    id: 100,
    nutritions: {
      calories: 49,
      fat: 0.2,
      sugar: 5,
      carbohydrates: 12,
      protein: 2,
    },
  },
  {
    name: 'Japanese Persimmon',
    id: 101,
    nutritions: {
      calories: 118,
      fat: 0.3,
      sugar: 21,
      carbohydrates: 31,
      protein: 1,
    },
  },
  {
    name: 'Papaya',
    id: 42,
    nutritions: {
      calories: 119,
      fat: 0.4,
      sugar: 18,
      carbohydrates: 30,
      protein: 1.3,
    },
  },
  {
    name: 'Annona',
    id: 103,
    nutritions: {
      calories: 92,
      fat: 0.29,
      sugar: 3.4,
      carbohydrates: 19.1,
      protein: 1.5,
    },
  },
  {
    name: 'Ceylon Gooseberry',
    id: 104,
    nutritions: {
      calories: 47,
      fat: 0.3,
      sugar: 8.1,
      carbohydrates: 9.6,
      protein: 1.2,
    },
  },
].map(f => ({
  ...f,
  baseRating:
    f.name === 'Hazelnut'
      ? 8
      : f.name === 'Durian'
      ? 6
      : f.name === 'Pumpkin'
      ? 8
      : 9,
}));

// ---------------------------------------------------------------------------
// Mock food database (grains, proteins, dairy, nuts, seeds, vegetables)
// ---------------------------------------------------------------------------
const MOCK_FOOD_DATABASE: { [key: string]: any } = {
  Spinach: {
    calories: 23,
    protein: 2.9,
    vitamins: ['A', 'C', 'K'],
    minerals: ['Iron', 'Calcium', 'Magnesium'],
    baseRating: 10,
  },
  Broccoli: {
    calories: 55,
    protein: 3.7,
    vitamins: ['C', 'K', 'A'],
    minerals: ['Potassium'],
    baseRating: 10,
  },
  Carrot: {
    calories: 41,
    protein: 0.9,
    vitamins: ['A', 'K'],
    minerals: ['Potassium'],
    baseRating: 9,
  },
  Cucumber: {
    calories: 15,
    protein: 0.7,
    vitamins: ['K'],
    minerals: ['Potassium'],
    baseRating: 9,
  },
  Potato: {
    calories: 77,
    protein: 2,
    vitamins: ['B6', 'C'],
    minerals: ['Potassium'],
    baseRating: 7,
  },
  Onion: {
    calories: 40,
    protein: 1.1,
    vitamins: ['C', 'B6'],
    minerals: ['Potassium'],
    baseRating: 8,
  },
  'Bell Pepper': {
    calories: 20,
    protein: 0.9,
    vitamins: ['C', 'A'],
    minerals: ['Potassium'],
    baseRating: 9,
  },
  Lettuce: {
    calories: 15,
    protein: 1.4,
    vitamins: ['A', 'K'],
    minerals: ['Potassium'],
    baseRating: 9,
  },
  Cauliflower: {
    calories: 25,
    protein: 1.9,
    vitamins: ['C', 'K'],
    minerals: ['Potassium'],
    baseRating: 9,
  },
  Eggplant: {
    calories: 25,
    protein: 1,
    vitamins: ['K'],
    minerals: ['Manganese'],
    baseRating: 8,
  },
  Cabbage: {
    calories: 25,
    protein: 1.3,
    vitamins: ['C', 'K'],
    minerals: ['Potassium'],
    baseRating: 9,
  },
  'Green Beans': {
    calories: 31,
    protein: 1.8,
    vitamins: ['C', 'K'],
    minerals: ['Manganese'],
    baseRating: 9,
  },
  'White Rice': {
    calories: 130,
    protein: 2.7,
    vitamins: [],
    minerals: [],
    baseRating: 5,
  },
  'Brown Rice': {
    calories: 111,
    protein: 2.6,
    vitamins: ['B1', 'B6'],
    minerals: ['Manganese', 'Magnesium'],
    baseRating: 8,
  },
  Oats: {
    calories: 389,
    protein: 16.9,
    vitamins: ['B1'],
    minerals: ['Manganese', 'Phosphorus', 'Magnesium'],
    baseRating: 9,
  },
  'Whole Wheat Bread': {
    calories: 265,
    protein: 13,
    vitamins: ['B1', 'Niacin'],
    minerals: ['Manganese', 'Selenium'],
    baseRating: 7,
  },
  Corn: {
    calories: 86,
    protein: 3.2,
    vitamins: ['B1', 'Folate'],
    minerals: ['Magnesium'],
    baseRating: 7,
  },
  'Sorghum Flour': {
    calories: 364,
    protein: 10.2,
    vitamins: ['B1', 'Niacin'],
    minerals: ['Phosphorus', 'Magnesium'],
    baseRating: 7,
  },
  Farro: {
    calories: 367,
    protein: 12.6,
    vitamins: ['B3'],
    minerals: ['Magnesium', 'Zinc'],
    baseRating: 8,
  },
  'Chicken Breast': {
    calories: 165,
    protein: 31,
    vitamins: ['B6', 'Niacin'],
    minerals: ['Selenium', 'Phosphorus'],
    baseRating: 9,
  },
  Salmon: {
    calories: 208,
    protein: 20,
    vitamins: ['D', 'B12', 'B6'],
    minerals: ['Selenium'],
    baseRating: 10,
  },
  Eggs: {
    calories: 155,
    protein: 13,
    vitamins: ['D', 'B12', 'A'],
    minerals: ['Selenium', 'Phosphorus'],
    baseRating: 8,
  },
  Paneer: {
    calories: 265,
    protein: 18,
    vitamins: ['B12'],
    minerals: ['Calcium'],
    baseRating: 7,
  },
  Tofu: {
    calories: 76,
    protein: 8,
    vitamins: [],
    minerals: ['Calcium', 'Manganese'],
    baseRating: 8,
  },
  Lentils: {
    calories: 116,
    protein: 9,
    vitamins: ['Folate', 'B1'],
    minerals: ['Iron', 'Manganese', 'Phosphorus'],
    baseRating: 9,
  },
  'Kidney Beans': {
    calories: 127,
    protein: 8.7,
    vitamins: ['Folate'],
    minerals: ['Iron', 'Manganese'],
    baseRating: 9,
  },
  Chickpeas: {
    calories: 139,
    protein: 7,
    vitamins: ['Folate'],
    minerals: ['Iron', 'Manganese'],
    baseRating: 9,
  },
  'Black Beans': {
    calories: 132,
    protein: 8.9,
    vitamins: ['Folate'],
    minerals: ['Magnesium', 'Manganese'],
    baseRating: 9,
  },
  'Pinto Beans': {
    calories: 117,
    protein: 6.7,
    vitamins: ['Folate'],
    minerals: ['Manganese', 'Phosphorus'],
    baseRating: 9,
  },
  Milk: {
    calories: 42,
    protein: 3.4,
    vitamins: ['D', 'B12'],
    minerals: ['Calcium', 'Phosphorus'],
    baseRating: 7,
  },
  Yogurt: {
    calories: 59,
    protein: 10,
    vitamins: ['B12'],
    minerals: ['Calcium', 'Phosphorus'],
    baseRating: 8,
  },
  'Almond Milk': {
    calories: 17,
    protein: 0.4,
    vitamins: ['E'],
    minerals: ['Calcium'],
    baseRating: 6,
  },
  Almonds: {
    calories: 579,
    protein: 21,
    vitamins: ['E'],
    minerals: ['Magnesium', 'Manganese'],
    baseRating: 8,
  },
  Walnuts: {
    calories: 654,
    protein: 15,
    vitamins: ['B6'],
    minerals: ['Copper', 'Manganese'],
    baseRating: 8,
  },
  'Chia Seeds': {
    calories: 486,
    protein: 17,
    vitamins: [],
    minerals: ['Manganese', 'Phosphorus', 'Calcium'],
    baseRating: 9,
  },
  'Pumpkin Seeds': {
    calories: 559,
    protein: 30,
    vitamins: [],
    minerals: ['Magnesium', 'Zinc', 'Iron'],
    baseRating: 9,
  },
};

// ---------------------------------------------------------------------------
// Detailed vegetable/fruit nutrient data (per 100 g)
// ---------------------------------------------------------------------------
const FULL_FRUIT_VEG_JSON_DATA = [
  {
    name: 'Tomatoes, grape, raw',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Water', value: 92.5 },
      { nutrientName: 'Vitamin C, total ascorbic acid', value: 27.2 },
      { nutrientName: 'Total lipid (fat)', value: 0.63 },
      { nutrientName: 'Calcium, Ca', value: 11.0 },
      { nutrientName: 'Iron, Fe', value: 0.33 },
      { nutrientName: 'Magnesium, Mg', value: 11.9 },
      { nutrientName: 'Phosphorus, P', value: 28.0 },
      { nutrientName: 'Potassium, K', value: 260 },
      { nutrientName: 'Zinc, Zn', value: 0.2 },
      { nutrientName: 'Vitamin E (alpha-tocopherol)', value: 0.98 },
      { nutrientName: 'Vitamin K (phylloquinone)', value: 4.2 },
      { nutrientName: 'Riboflavin', value: 0.065 },
      { nutrientName: 'Thiamin', value: 0.075 },
      { nutrientName: 'Vitamin B-6', value: 0.06 },
      { nutrientName: 'Folate, total', value: 10.0 },
      { nutrientName: 'Niacin', value: 0.805 },
      { nutrientName: 'Protein', value: 0.83 },
      { nutrientName: 'Carbohydrate, by difference', value: 5.51 },
      { nutrientName: 'Energy', value: 27.0, unitName: 'kcal' },
    ],
  },
  {
    name: 'Beans, snap, green, raw',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Energy', value: 31, unitName: 'kcal' },
      { nutrientName: 'Carbohydrate, by difference', value: 6.97 },
      { nutrientName: 'Fiber, total dietary', value: 2.7 },
      { nutrientName: 'Sugars, Total', value: 3.26 },
      { nutrientName: 'Protein', value: 1.83 },
      { nutrientName: 'Total lipid (fat)', value: 0.22 },
      { nutrientName: 'Water', value: 90.3 },
      { nutrientName: 'Calcium, Ca', value: 37 },
      { nutrientName: 'Iron, Fe', value: 1.03 },
      { nutrientName: 'Magnesium, Mg', value: 25 },
      { nutrientName: 'Phosphorus, P', value: 38 },
      { nutrientName: 'Potassium, K', value: 211 },
      { nutrientName: 'Sodium, Na', value: 6 },
      { nutrientName: 'Zinc, Zn', value: 0.24 },
      { nutrientName: 'Vitamin C, total ascorbic acid', value: 12.2 },
      { nutrientName: 'Thiamin', value: 0.082 },
      { nutrientName: 'Riboflavin', value: 0.104 },
      { nutrientName: 'Niacin', value: 0.734 },
      { nutrientName: 'Vitamin B-6', value: 0.141 },
      { nutrientName: 'Folate, total', value: 33 },
      { nutrientName: 'Vitamin A, RAE', value: 35 },
      { nutrientName: 'Vitamin E (alpha-tocopherol)', value: 0.41 },
      { nutrientName: 'Vitamin K (phylloquinone)', value: 14.4 },
    ],
  },
  {
    name: 'Onions, red, raw',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Water', value: 88.6 },
      { nutrientName: 'Vitamin C, total ascorbic acid', value: 8.1 },
      { nutrientName: 'Total lipid (fat)', value: 0.1 },
      { nutrientName: 'Calcium, Ca', value: 17.0 },
      { nutrientName: 'Iron, Fe', value: 0.24 },
      { nutrientName: 'Magnesium, Mg', value: 11.4 },
      { nutrientName: 'Phosphorus, P', value: 41.0 },
      { nutrientName: 'Potassium, K', value: 197 },
      { nutrientName: 'Zinc, Zn', value: 0.17 },
      { nutrientName: 'Manganese, Mn', value: 0.119 },
      { nutrientName: 'Protein', value: 0.94 },
      { nutrientName: 'Carbohydrate, by difference', value: 9.93 },
      { nutrientName: 'Energy', value: 44.0, unitName: 'kcal' },
      { nutrientName: 'Sugars, Total', value: 5.76 },
    ],
  },
  {
    name: 'Carrots, mature, raw',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Water', value: 87.7 },
      { nutrientName: 'Vitamin C, total ascorbic acid', value: 5.9 },
      { nutrientName: 'Total lipid (fat)', value: 0.35 },
      { nutrientName: 'Calcium, Ca', value: 30.5 },
      { nutrientName: 'Iron, Fe', value: 0.15 },
      { nutrientName: 'Magnesium, Mg', value: 12.4 },
      { nutrientName: 'Phosphorus, P', value: 39.8 },
      { nutrientName: 'Potassium, K', value: 280 },
      { nutrientName: 'Zinc, Zn', value: 0.236 },
      { nutrientName: 'Manganese, Mn', value: 0.13 },
      { nutrientName: 'Protein', value: 0.941 },
      { nutrientName: 'Carbohydrate, by difference', value: 10.3 },
      { nutrientName: 'Energy', value: 45.0, unitName: 'kcal' },
      { nutrientName: 'Sugars, Total', value: 4.74 },
      { nutrientName: 'Vitamin A, RAE', value: 835 },
      { nutrientName: 'Vitamin K (phylloquinone)', value: 13.2 },
    ],
  },
  {
    name: 'Spinach, baby',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Water', value: 92.5 },
      { nutrientName: 'Vitamin C, total ascorbic acid', value: 26.5 },
      { nutrientName: 'Total lipid (fat)', value: 0.619 },
      { nutrientName: 'Calcium, Ca', value: 68.4 },
      { nutrientName: 'Iron, Fe', value: 1.26 },
      { nutrientName: 'Magnesium, Mg', value: 92.9 },
      { nutrientName: 'Phosphorus, P', value: 39.0 },
      { nutrientName: 'Potassium, K', value: 582 },
      { nutrientName: 'Zinc, Zn', value: 0.447 },
      { nutrientName: 'Manganese, Mn', value: 0.488 },
      { nutrientName: 'Protein', value: 2.85 },
      { nutrientName: 'Carbohydrate, by difference', value: 2.41 },
      { nutrientName: 'Energy', value: 20.7, unitName: 'kcal' },
      { nutrientName: 'Vitamin A, RAE', value: 283 },
      { nutrientName: 'Vitamin K (phylloquinone)', value: 381 },
      { nutrientName: 'Folate, total', value: 116 },
    ],
  },
  {
    name: 'Lettuce, iceberg, raw',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Energy', value: 14, unitName: 'kcal' },
      { nutrientName: 'Carbohydrate, by difference', value: 2.97 },
      { nutrientName: 'Fiber, total dietary', value: 1.2 },
      { nutrientName: 'Sugars, Total', value: 1.97 },
      { nutrientName: 'Protein', value: 0.9 },
      { nutrientName: 'Total lipid (fat)', value: 0.14 },
      { nutrientName: 'Water', value: 95.6 },
      { nutrientName: 'Calcium, Ca', value: 18 },
      { nutrientName: 'Iron, Fe', value: 0.41 },
      { nutrientName: 'Magnesium, Mg', value: 7 },
      { nutrientName: 'Phosphorus, P', value: 20 },
      { nutrientName: 'Potassium, K', value: 141 },
      { nutrientName: 'Sodium, Na', value: 10 },
      { nutrientName: 'Zinc, Zn', value: 0.15 },
      { nutrientName: 'Vitamin C, total ascorbic acid', value: 2.8 },
      { nutrientName: 'Thiamin', value: 0.041 },
      { nutrientName: 'Riboflavin', value: 0.025 },
      { nutrientName: 'Niacin', value: 0.123 },
      { nutrientName: 'Vitamin B-6', value: 0.042 },
      { nutrientName: 'Folate, total', value: 29 },
      { nutrientName: 'Vitamin A, RAE', value: 25 },
      { nutrientName: 'Vitamin E (alpha-tocopherol)', value: 0.18 },
      { nutrientName: 'Vitamin K (phylloquinone)', value: 24.1 },
    ],
  },
  {
    name: 'Peas, green, sweet, canned, sodium added, sugar added, drained and rinsed',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Energy', value: 77.8, unitName: 'kcal' },
      { nutrientName: 'Carbohydrate, by difference', value: 12.7 },
      { nutrientName: 'Starch', value: 4.48 },
      { nutrientName: 'Protein', value: 4.73 },
      { nutrientName: 'Total lipid (fat)', value: 1.15 },
      { nutrientName: 'Water', value: 80.5 },
      { nutrientName: 'Calcium, Ca', value: 28.2 },
      { nutrientName: 'Iron, Fe', value: 1.14 },
      { nutrientName: 'Magnesium, Mg', value: 21.9 },
      { nutrientName: 'Phosphorus, P', value: 77.7 },
      { nutrientName: 'Potassium, K', value: 109 },
      { nutrientName: 'Sodium, Na', value: 207 },
      { nutrientName: 'Zinc, Zn', value: 0.712 },
      { nutrientName: 'Copper, Cu', value: 0.123 },
      { nutrientName: 'Manganese, Mn', value: 0.285 },
    ],
  },
  {
    name: 'Sweet potatoes, orange flesh, without skin, raw',
    type: 'vegetable',
    nutrients: [
      { nutrientName: 'Energy', value: 77.4, unitName: 'kcal' },
      { nutrientName: 'Carbohydrate, by difference', value: 17.3 },
      { nutrientName: 'Sugars, Total', value: 6.06 },
      { nutrientName: 'Protein', value: 1.58 },
      { nutrientName: 'Total lipid (fat)', value: 0.375 },
      { nutrientName: 'Water', value: 79.5 },
      { nutrientName: 'Calcium, Ca', value: 22.3 },
      { nutrientName: 'Iron, Fe', value: 0.398 },
      { nutrientName: 'Magnesium, Mg', value: 19.1 },
      { nutrientName: 'Phosphorus, P', value: 36.7 },
      { nutrientName: 'Potassium, K', value: 486 },
      { nutrientName: 'Zinc, Zn', value: 0.337 },
      { nutrientName: 'Vitamin C, total ascorbic acid', value: 14.8 },
      { nutrientName: 'Thiamin', value: 0.045 },
      { nutrientName: 'Niacin', value: 0.432 },
      { nutrientName: 'Vitamin B-6', value: 0.124 },
      { nutrientName: 'Vitamin A, RAE', value: 787 },
      { nutrientName: 'Vitamin E (alpha-tocopherol)', value: 0.71 },
      { nutrientName: 'Vitamin K (phylloquinone)', value: 0.2 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Build processed & combined databases
// ---------------------------------------------------------------------------
const PROCESSED_FRUIT_VEG_DATA = FULL_FRUIT_VEG_JSON_DATA.map(item => {
  const nutritions = extractNutrients(item.nutrients);
  const nameLower = item.name.toLowerCase();
  let baseRating = 9;
  if (
    nameLower.includes('canned') ||
    nameLower.includes('juice') ||
    nameLower.includes('prepared') ||
    nameLower.includes('pickle') ||
    nameLower.includes('ring')
  )
    baseRating = 4;
  else if (nameLower.includes('flour') || nameLower.includes('grain'))
    baseRating = 7;
  else if (nameLower.includes('seeds') || nameLower.includes('nut'))
    baseRating = 8;
  else if (nameLower.includes('beans')) baseRating = 8;
  else if (
    nameLower.includes('potato') ||
    nameLower.includes('corn') ||
    nameLower.includes('squash')
  )
    baseRating = 7;

  const type = nameLower.includes('bean')
    ? 'legume'
    : nameLower.includes('seed') || nameLower.includes('nut')
    ? 'seed'
    : nameLower.includes('flour') ||
      nameLower.includes('grain') ||
      nameLower.includes('farro') ||
      nameLower.includes('sorghum')
    ? 'grain'
    : nameLower.includes('corn') ||
      nameLower.includes('lettuce') ||
      nameLower.includes('cabbage') ||
      nameLower.includes('onion') ||
      nameLower.includes('carrot') ||
      nameLower.includes('potato') ||
      nameLower.includes('broccoli') ||
      nameLower.includes('cauliflower') ||
      nameLower.includes('eggplant') ||
      nameLower.includes('squash') ||
      nameLower.includes('cucumber') ||
      nameLower.includes('pepper') ||
      nameLower.includes('spinach') ||
      nameLower.includes('peas')
    ? 'vegetable'
    : nameLower.includes('apple') ||
      nameLower.includes('banana') ||
      nameLower.includes('orange') ||
      nameLower.includes('pear') ||
      nameLower.includes('grape') ||
      nameLower.includes('melon') ||
      nameLower.includes('kiwi') ||
      nameLower.includes('mango') ||
      nameLower.includes('juice') ||
      nameLower.includes('plum') ||
      nameLower.includes('cherry') ||
      nameLower.includes('berry') ||
      nameLower.includes('fruit')
    ? 'fruit'
    : 'other';

  return {
    id: item.name,
    name: item.name.split(',')[0],
    type,
    nutritions,
    baseRating,
    isPer100g: true,
  };
});

const COMBINED_FRUIT_VEG_DATABASE = [
  ...FRUIT_DATABASE.map(f => ({
    ...f,
    id: f.name,
    type: 'fruit' as const,
    isUserProvided: true,
    isPer100g: false,
    nutritions: { ...f.nutritions, vitamins: [], minerals: [] },
  })),
  ...PROCESSED_FRUIT_VEG_DATA.filter(
    newItem =>
      !FRUIT_DATABASE.some(
        existing => existing.name.toLowerCase() === newItem.name.toLowerCase(),
      ),
  ),
];

// Enrich MOCK_FOOD_DATABASE with inferred types
Object.entries(MOCK_FOOD_DATABASE).forEach(([key, value]) => {
  const keyLower = key.toLowerCase();
  if (!value.type) {
    if (
      keyLower.includes('rice') ||
      keyLower.includes('oats') ||
      keyLower.includes('bread') ||
      keyLower.includes('sorghum') ||
      keyLower.includes('farro')
    )
      value.type = 'grain';
    else if (
      keyLower.includes('chicken') ||
      keyLower.includes('salmon') ||
      keyLower.includes('eggs') ||
      keyLower.includes('paneer') ||
      keyLower.includes('tofu') ||
      keyLower.includes('lentils') ||
      keyLower.includes('beans')
    )
      value.type = 'protein';
    else if (keyLower.includes('milk') || keyLower.includes('yogurt'))
      value.type = 'dairy';
    else if (
      keyLower.includes('almonds') ||
      keyLower.includes('walnuts') ||
      keyLower.includes('seeds')
    )
      value.type = 'seed';
    else if (
      !COMBINED_FRUIT_VEG_DATABASE.some(
        fv => fv.name.toLowerCase() === keyLower,
      )
    )
      value.type = 'other';
  }
  if (value.baseRating === undefined) value.baseRating = 6;
  if (!value.vitamins) value.vitamins = [];
  if (!value.minerals) value.minerals = [];
});

export const FULL_FOOD_DATABASE = [
  ...COMBINED_FRUIT_VEG_DATABASE,
  ...Object.entries(MOCK_FOOD_DATABASE)
    .filter(
      ([key]) =>
        !COMBINED_FRUIT_VEG_DATABASE.some(
          fv => fv.name.toLowerCase() === key.toLowerCase(),
        ),
    )
    .map(([key, value]) => ({
      id: key,
      name: key,
      type: value.type || 'other',
      nutritions: {
        calories: value.calories,
        protein: value.protein,
        vitamins: value.vitamins || [],
        minerals: value.minerals || [],
        fat: value.fat || 0,
        sugar: value.sugar || 0,
        carbohydrates: value.carbohydrates || 0,
      },
      baseRating: value.baseRating || 6,
      isPer100g: !['Eggs'].includes(key),
    })),
];
