/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db';
import { AiRecommendationResponse, FoodItem } from '../src/types';

export async function getFoodRecommendations(params: {
  userQuery: string;
  userDietaryPreferences?: string[];
  budget?: number;
  userHistoryItemIds?: string[];
}): Promise<AiRecommendationResponse> {
  const activeFoods = db.getFoods({ availableOnly: true });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful smart rule-based recommendation fallback
    return getFallbackRecommendations(params, activeFoods, 'Smart Rule-Based Engine (Add GEMINI_API_KEY in Secrets for live AI)');
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Provide condensed menu representation to Gemini
    const menuContext = activeFoods.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.categoryName,
      price: f.price,
      vegetarian: f.vegetarian,
      spiceLevel: f.spiceLevel,
      allergens: f.allergens,
      ingredients: f.ingredients,
      rating: f.rating,
      description: f.description,
    }));

    const systemPrompt = `You are "Foodie AI", the friendly culinary concierge for FoodieHub.
Your mission is to recommend the best dishes for the customer's request from the PROVIDED MENU ONLY.

CRITICAL RULES:
1. ONLY recommend dishes that exist in the provided JSON menu items list. NEVER invent dishes, prices, or ingredients.
2. Respect the customer's budget (in INR ₹), vegetarian/non-vegetarian preferences, spice tolerance, and allergens.
3. Be cautious with allergies: note the known ingredients and warn the user to check with kitchen for cross-contamination.
4. Select 1 to 4 of the best matching dishes.
5. Provide a warm, appetizing 1-2 sentence adviceSummary explaining your selection, along with a specific reason and optional pairing suggestion (like a beverage or dessert) for each dish.`;

    const promptContent = `Customer Request: "${params.userQuery}"
Customer Dietary Preferences: ${params.userDietaryPreferences?.join(', ') || 'None specified'}
Max Budget: ${params.budget ? `₹${params.budget}` : 'Flexible'}
Recently Ordered Food IDs: ${params.userHistoryItemIds?.join(', ') || 'None'}

Available Menu Items:
${JSON.stringify(menuContext, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adviceSummary: {
              type: Type.STRING,
              description: 'Warm, appetizing summary explaining why these dishes fit the request.',
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  foodId: {
                    type: Type.STRING,
                    description: 'The exact ID of the food item from the menu list (e.g. food-1)',
                  },
                  reason: {
                    type: Type.STRING,
                    description: 'Specific reason this dish was selected for the user.',
                  },
                  pairingSuggestion: {
                    type: Type.STRING,
                    description: 'Optional beverage or dessert pairing recommendation.',
                  },
                },
                required: ['foodId', 'reason'],
              },
            },
          },
          required: ['adviceSummary', 'recommendations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const recommendedList: AiRecommendationResponse['recommendedItems'] = [];

    if (Array.isArray(parsed.recommendations)) {
      for (const rec of parsed.recommendations) {
        const matchingFood = activeFoods.find((f) => f.id === rec.foodId);
        if (matchingFood) {
          recommendedList.push({
            item: matchingFood,
            reason: rec.reason || 'Specially selected by Foodie AI for your palate.',
            pairingSuggestion: rec.pairingSuggestion,
          });
        }
      }
    }

    if (recommendedList.length === 0) {
      return getFallbackRecommendations(params, activeFoods, 'Personalized selection from our menu');
    }

    return {
      adviceSummary: parsed.adviceSummary || 'Here are our chef-curated recommendations based on your craving:',
      recommendedItems: recommendedList,
      isAiGenerated: true,
    };
  } catch (error) {
    console.error('Gemini AI Food Assistant error, using fallback:', error);
    return getFallbackRecommendations(params, activeFoods, 'Rule-based Chef Recommendations');
  }
}

/**
 * Robust rule-based fallback when GEMINI_API_KEY is not set or network fails
 */
function getFallbackRecommendations(
  params: {
    userQuery: string;
    userDietaryPreferences?: string[];
    budget?: number;
  },
  activeFoods: FoodItem[],
  sourceLabel: string
): AiRecommendationResponse {
  const query = params.userQuery.toLowerCase();
  let candidateFoods = [...activeFoods];

  // Check veg query
  if (query.includes('veg') && !query.includes('non-veg')) {
    candidateFoods = candidateFoods.filter((f) => f.vegetarian);
  } else if (query.includes('chicken') || query.includes('non-veg') || query.includes('meat')) {
    candidateFoods = candidateFoods.filter((f) => !f.vegetarian);
  }

  // Check spice query
  if (query.includes('spicy') || query.includes('hot')) {
    candidateFoods = candidateFoods.filter((f) => f.spiceLevel === 'Hot' || f.spiceLevel === 'Medium');
  } else if (query.includes('mild') || query.includes('sweet')) {
    candidateFoods = candidateFoods.filter((f) => f.spiceLevel === 'Mild' || f.spiceLevel === 'None');
  }

  // Budget filter
  if (params.budget && params.budget > 0) {
    candidateFoods = candidateFoods.filter((f) => f.price <= params.budget!);
  }

  // Category keyword matching
  if (query.includes('biryani') || query.includes('rice')) {
    const match = candidateFoods.filter((f) => f.categoryId === 'cat-biryani');
    if (match.length > 0) candidateFoods = match;
  } else if (query.includes('pizza') || query.includes('cheese')) {
    const match = candidateFoods.filter((f) => f.categoryId === 'cat-pizza');
    if (match.length > 0) candidateFoods = match;
  } else if (query.includes('burger') || query.includes('fries') || query.includes('snack')) {
    const match = candidateFoods.filter((f) => f.categoryId === 'cat-burgers');
    if (match.length > 0) candidateFoods = match;
  } else if (query.includes('dosa') || query.includes('idli') || query.includes('south')) {
    const match = candidateFoods.filter((f) => f.categoryId === 'cat-south-indian');
    if (match.length > 0) candidateFoods = match;
  } else if (query.includes('dessert') || query.includes('cake') || query.includes('sweet') || query.includes('chocolate')) {
    const match = candidateFoods.filter((f) => f.categoryId === 'cat-desserts');
    if (match.length > 0) candidateFoods = match;
  }

  // Sort by rating & popularity
  candidateFoods.sort((a, b) => b.rating - a.rating);
  const selected = candidateFoods.slice(0, 3);

  const recommendedItems = selected.map((item) => ({
    item,
    reason: `Highly rated (${item.rating}★) and matches your search for "${params.userQuery}" within budget.`,
    pairingSuggestion: item.categoryId !== 'cat-beverages' ? 'Pairs wonderfully with an Alphonso Mango Shake or Cold Coffee.' : undefined,
  }));

  return {
    adviceSummary: `Found ${recommendedItems.length} top dishes matching your taste and budget (${sourceLabel}).`,
    recommendedItems,
    isAiGenerated: false,
  };
}
