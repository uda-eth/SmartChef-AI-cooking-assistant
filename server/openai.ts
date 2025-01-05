import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type MealPlanRequest = {
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }>;
  preferences?: {
    dietary?: string[];
    cuisineTypes?: string[];
    mealCount: number;
  };
};

export type MealSuggestion = {
  name: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  prepTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";  // Added difficulty rating
};

export type WeeklyMealPlan = {
  meals: MealSuggestion[];
  shoppingList: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
};

export async function generateMealPlan(request: MealPlanRequest): Promise<WeeklyMealPlan> {
  const prompt = `Generate a weekly meal plan based on these ingredients and preferences:
    Available Ingredients: ${JSON.stringify(request.ingredients)}
    Preferences: ${JSON.stringify(request.preferences)}

    Please provide a meal plan in JSON format with the following structure:
    {
      "meals": [{
        "name": string,
        "ingredients": [{ "name": string, "quantity": number, "unit": string }],
        "instructions": string[],
        "prepTime": number,
        "servings": number,
        "difficulty": "easy" | "medium" | "hard"
      }],
      "shoppingList": [{ "name": string, "quantity": number, "unit": string }]
    }

    For each recipe:
    - Rate difficulty as "easy" if it takes less than 30 minutes and uses basic techniques
    - Rate as "medium" if it takes 30-60 minutes or requires intermediate techniques
    - Rate as "hard" if it takes over 60 minutes or requires advanced techniques

    The meals should be beginner-friendly and use common cooking techniques.
    Include a shopping list for additional ingredients needed.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content) as WeeklyMealPlan;
}

export async function suggestRecipeSubstitutions(
  recipe: MealSuggestion,
  availableIngredients: Array<{ name: string; quantity: number; unit: string }>
): Promise<{ substitutions: Array<{ original: string; substitute: string }> }> {
  const prompt = `Given this recipe and available ingredients, suggest substitutions for missing ingredients:
    Recipe: ${JSON.stringify(recipe)}
    Available Ingredients: ${JSON.stringify(availableIngredients)}

    Provide substitutions in JSON format:
    {
      "substitutions": [{ "original": string, "substitute": string }]
    }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}