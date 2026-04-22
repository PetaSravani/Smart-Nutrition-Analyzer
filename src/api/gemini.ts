import { GEMINI_API_KEY } from '@env';
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { UserPrefs, HealthHistory } from '../types';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ---------------------------------------------------------------------------
// Shared retry-fetch helper
// ---------------------------------------------------------------------------
const retryFetch = async (url: string, payload: object, maxRetries = 5) => {
  let response: Response | undefined;
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) break;
    if (response.status === 429 || response.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    } else {
      throw new Error(`API call failed with status: ${response.status}`);
    }
  }
  if (!response || !response.ok)
    throw new Error('API call failed after retries');
  return response;
};

// ---------------------------------------------------------------------------
// Analyse a food label (OCR text → JSON)
// ---------------------------------------------------------------------------
export const callGeminiAPI = async (
  text: string,
  userPrefs: UserPrefs,
  healthHistory: HealthHistory,
) => {
  const systemPrompt = `You are a world-class nutrition analyst. Your task is to analyze the text from a food label and provide a structured JSON response. IMPORTANT: The following text is from an OCR scan and may contain errors. Please do your best to interpret the text, correct for common OCR mistakes (like confusing '1' and 'l', 'O' and '0'), and extract the nutritional information as accurately as possible, even if the text is not perfectly formatted.
The user's health profile is as follows: Goal: ${userPrefs.goal}, Likes: ${
    userPrefs.likes
  }, Dislikes/Allergies: ${
    userPrefs.dislikes
  }, Health Conditions: ${healthHistory.conditions.join(', ')} (${
    healthHistory.other
  }). Based on this profile and the ingredients, you must return a JSON object with the following structure:
{
  "name": "Product Name",
  "rating": <1-10>,
  "recommendation": "A personalized recommendation for the user.",
  "manufacturingDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null",
  "warningsAndNotes": ["string"],
  "packageWeightGrams": <number or null>,
  "isPer100g": <true|false>,
  "calories": <number or null>,
  "protein": <number or null>,
  "vitamins": ["string"],
  "minerals": ["string"],
  "nutritionFacts": {
    "servingSize": "string or null",
    "calories": "string or null",
    "totalFat": "string or null",
    "carbohydrates": "string or null",
    "protein": "string or null",
    "sugars": "string or null",
    "sodium": "string or null"
  },
  "fullIngredientList": ["string"],
  "ingredientsAnalysis": [{ "name": "string", "analysis": "string", "health_impact": "good"|"neutral"|"bad" }],
  "alternatives": ["string"]
}`;

  const payload = {
    contents: [{ parts: [{ text: `Analyze this food label text: ${text}` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: 'application/json' },
  };

  try {
    const response = await retryFetch(GEMINI_URL, payload);
    const result = await response.json();
    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
      const jsonText = candidate.content.parts[0].text.replace(
        /,\s*([}\]])/g,
        '$1',
      );
      return JSON.parse(jsonText);
    }
    throw new Error('Invalid response structure from analysis API');
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return { error: 'Failed to analyze the food label. Please try again.' };
  }
};

// ---------------------------------------------------------------------------
// Estimate nutrition for a free-text food name
// ---------------------------------------------------------------------------
export const analyzeManualFoodItem = async (
  foodName: string,
  userPrefs: UserPrefs,
  healthHistory: HealthHistory,
) => {
  const systemPrompt = `You are a world-class nutrition estimator. A user will provide a food name. Your task is to estimate the nutritional information for a *single, typical serving* (e.g., 1 bowl, 1 piece, 100g). Also provide a health rating (1-10) based on the food's general healthiness and the user's specific health profile.

User Health Profile:
- Goal: ${userPrefs.goal}
- Dislikes/Allergies: ${userPrefs.dislikes}
- Health Conditions: ${healthHistory.conditions.join(', ')} (${
    healthHistory.other
  })

Return ONLY a JSON object with this exact structure (no nulls for nutrient numbers):
{
  "name": "User's Food Name",
  "calories": 150,
  "protein": 10,
  "fat": 5,
  "carbohydrates": 20,
  "sugar": 5,
  "vitamins": ["C"],
  "minerals": ["Iron"],
  "rating": 7
}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Estimate nutritional data for a typical serving of: ${foodName}`,
          },
        ],
      },
    ],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: 'application/json' },
  };

  try {
    const response = await retryFetch(GEMINI_URL, payload);
    const result = await response.json();
    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
      const jsonText = candidate.content.parts[0].text.replace(
        /,\s*([}\]])/g,
        '$1',
      );
      const parsed = JSON.parse(jsonText);
      parsed.name = foodName;
      parsed.calories = Number(parsed.calories) || 0;
      parsed.protein = Number(parsed.protein) || 0;
      parsed.fat = Number(parsed.fat) || 0;
      parsed.carbohydrates = Number(parsed.carbohydrates) || 0;
      parsed.sugar = Number(parsed.sugar) || 0;
      parsed.rating = Number(parsed.rating) || 5;
      parsed.vitamins = Array.isArray(parsed.vitamins) ? parsed.vitamins : [];
      parsed.minerals = Array.isArray(parsed.minerals) ? parsed.minerals : [];
      return parsed;
    }
    throw new Error('Invalid response structure from manual analysis API');
  } catch (error: any) {
    console.error('Error calling manual food analysis API:', error);
    return { error: 'Failed to analyze the food item. Please try again.' };
  }
};

// ---------------------------------------------------------------------------
// Generate RL meal candidates pool and persist to Firestore
// ---------------------------------------------------------------------------
export const generateMealCandidates = async (
  userPrefs: UserPrefs,
  healthHistory: HealthHistory,
  db: Firestore,
  userId: string,
  appId: string,
) => {
  const goalDescriptions: Record<string, string> = {
    'Weight Loss':
      'low-calorie (around 300-500 cal) and high in protein/fiber.',
    'Weight Gain': 'calorie-dense and high in protein (around 500-700 cal).',
    Fitness: 'high in protein and complex carbs (around 400-600 cal).',
  };
  const goalDescription =
    goalDescriptions[userPrefs.goal] || 'well-balanced (around 400-600 cal).';

  const systemPrompt = `You are a creative nutrition assistant. Generate 10 meal suggestions for a *specific meal type* for Indian people.
User Health Profile:
- Goal: ${userPrefs.goal}. Meals should be ${goalDescription}
- Dislikes/Allergies: ${userPrefs.dislikes} (CRITICAL: Do not include these)
- Health Conditions: ${healthHistory.conditions.join(', ')} (${
    healthHistory.other
  })

Return ONLY a JSON object:
{ "suggestions": [{ "name": "Meal Name", "calories": 450 }, ...10 total] }`;

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
  let allCandidates: { name: string; calories: number; mealType: string }[] =
    [];
  let hasError = false;

  for (const mealType of mealTypes) {
    const payload = {
      contents: [{ parts: [{ text: `Generate 10 ${mealType} meals.` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: 'application/json' },
    };
    try {
      const response = await retryFetch(GEMINI_URL, payload, 3);
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate?.content?.parts?.[0]?.text) {
        const parsed = JSON.parse(
          candidate.content.parts[0].text.replace(/,\s*([}\]])/g, '$1'),
        );
        if (Array.isArray(parsed.suggestions)) {
          allCandidates = [
            ...allCandidates,
            ...parsed.suggestions.map((s: any) => ({ ...s, mealType })),
          ];
        } else throw new Error(`Invalid JSON structure for ${mealType}`);
      } else throw new Error(`Invalid response structure for ${mealType}`);
    } catch (error: any) {
      console.error('Error calling Gemini meal suggestion API:', error);
      hasError = true;
    }
  }

  if (hasError)
    throw new Error(
      'Failed to generate one or more meal categories. Please try again.',
    );

  const candidatesRef = collection(
    db,
    'artifacts',
    appId,
    'users',
    userId,
    'rlMealCandidates',
  );
  const feedbackRef = collection(
    db,
    'artifacts',
    appId,
    'users',
    userId,
    'rlSuggestionFeedback',
  );

  const [oldCandidates, oldFeedback] = await Promise.all([
    getDocs(candidatesRef),
    getDocs(feedbackRef),
  ]);

  const deleteBatch = writeBatch(db);
  oldCandidates.forEach(d => deleteBatch.delete(d.ref));
  oldFeedback.forEach(d => deleteBatch.delete(d.ref));
  await deleteBatch.commit();

  const writeBatchInst = writeBatch(db);
  allCandidates.forEach(meal => {
    const newRef = doc(candidatesRef);
    writeBatchInst.set(newRef, meal);
  });
  await writeBatchInst.commit();
};
