const API_URL = 'http://192.168.1.10:8000';

export const getAIRecommendation = async (
  scannedData: any,
  userProfile: any,
  algorithm: string = 'dqn',
) => {
  try {
    const response = await fetch(`${API_URL}/recommend?algo=${algorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userProfile.id,
        calories_today: userProfile.caloriesToday,
        sugar_today: userProfile.sugarToday,
        goal: userProfile.goal,
        health_conditions: userProfile.conditions,

        scanned_food_name: scannedData.name,
        scanned_food_calories: scannedData.calories,
        scanned_food_sugar: scannedData.sugar,
        scanned_food_category: 'snack',
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('RL Server Error:', error);
    return null;
  }
};

export const sendAIFeedback = async (action: number, reward: number) => {
  try {
    await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'user_123',
        action_taken: action,
        reward: reward,
        algorithm: 'dqn',
      }),
    });
  } catch (error) {
    console.error('Feedback Error:', error);
  }
};
