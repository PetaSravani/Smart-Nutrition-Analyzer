import { Firestore, Timestamp } from 'firebase/firestore';

export type UserPrefs = {
  goal: string;
  likes: string;
  dislikes: string;
  calorieGoal: number;
  proteinGoal: number;
  weeklyCalorieGoal: number;
  weeklyProteinGoal: number;
};

export type HealthHistory = {
  conditions: string[];
  other: string;
};

export type ScreenName =
  | 'Loading'
  | 'Onboarding'
  | 'Login'
  | 'Preferences'
  | 'HealthIssues'
  | 'Home'
  | 'Scan'
  | 'Analysis'
  | 'AllergyTracker'
  | 'ManualAllergy'
  | 'ManualEntry'
  | 'LogCommonItem'
  | 'Reports'
  | 'LogHistory'
  | 'Settings'
  | 'FoodReport'
  | 'FoodChoices';

export type FoodLogItem = {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  sugar: number;
  vitamins: string[];
  minerals: string[];
  mealType: string;
  rating: number;
  date: string | Timestamp;
};

export type AllergyLogItem = {
  id?: string;
  food: string;
  symptoms: string;
  date: string | Timestamp;
};

export type ScannedItem = {
  name: string;
  rating: number;
  recommendation: string;
  manufacturingDate: string | null;
  expiryDate: string | null;
  warningsAndNotes: string[];
  packageWeightGrams: number | null;
  isPer100g: boolean;
  calories: number | null;
  protein: number | null;
  vitamins: string[];
  minerals: string[];
  nutritionFacts: {
    servingSize: string | null;
    calories: string | null;
    totalFat: string | null;
    carbohydrates: string | null;
    protein: string | null;
    sugars: string | null;
    sodium: string | null;
  };
  fullIngredientList: string[];
  ingredientsAnalysis: {
    name: string;
    analysis: string;
    health_impact: 'good' | 'neutral' | 'bad';
  }[];
  alternatives: string[];
  error?: string;
};

export type RLFeedbackData = {
  [key: string]: {
    likes: number;
    dislikes: number;
  };
};

export type CommonScreenProps = {
  setScreen: (screen: ScreenName) => void;
  userPrefs: UserPrefs;
  healthHistory: HealthHistory;
  userId: string | null;
  db: Firestore | null;
  appId: string;
};
