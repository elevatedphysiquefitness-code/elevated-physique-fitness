import { NextResponse } from 'next/server';
import { searchFoods, FoodItem } from '@/lib/food-database';

// USDA FoodData Central API (for additional searches)
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';

interface SearchResult {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // First, search our comprehensive local database
    const localResults = searchFoods(query);

    // Convert to SearchResult format
    const results: SearchResult[] = localResults.map((food: FoodItem) => ({
      id: food.id,
      name: food.name,
      brand: food.brand,
      category: food.category,
      servingSize: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    }));

    // If we have enough results from local database, return them
    if (results.length >= 10) {
      return NextResponse.json({ results: results.slice(0, 20) });
    }

    // Otherwise, supplement with USDA API results
    try {
      const usdaResults = await searchUSDA(query);

      // Filter out USDA results that match local results (by name similarity)
      const localNames = new Set(results.map(r => r.name.toLowerCase()));
      const filteredUSDA = usdaResults.filter(
        r => !localNames.has(r.name.toLowerCase())
      );

      // Combine results (local first, then USDA)
      const combinedResults = [...results, ...filteredUSDA].slice(0, 20);

      return NextResponse.json({ results: combinedResults });
    } catch {
      // If USDA fails, just return local results
      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json({ results: [] });
  }
}

// Search USDA FoodData Central API
async function searchUSDA(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `${USDA_API_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=15&dataType=Foundation,SR Legacy`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error('USDA API request failed');
  }

  const data = await response.json();
  interface USDANutrient {
    nutrientNumber: string;
    value: number;
  }

  interface USDAFood {
    fdcId: number;
    description: string;
    brandOwner?: string;
    servingSize?: number;
    servingSizeUnit?: string;
    foodNutrients: USDANutrient[];
  }

  const foods: USDAFood[] = data.foods || [];

  return foods
    .map((food) => {
      const nutrients = food.foodNutrients || [];

      // Find key nutrients
      const calories = nutrients.find((n: USDANutrient) => n.nutrientNumber === '208')?.value || 0;
      const protein = nutrients.find((n: USDANutrient) => n.nutrientNumber === '203')?.value || 0;
      const carbs = nutrients.find((n: USDANutrient) => n.nutrientNumber === '205')?.value || 0;
      const fat = nutrients.find((n: USDANutrient) => n.nutrientNumber === '204')?.value || 0;

      let servingSize = '100g';
      if (food.servingSize && food.servingSizeUnit) {
        servingSize = `${food.servingSize}${food.servingSizeUnit}`;
      }

      return {
        id: `usda-${food.fdcId}`,
        name: formatFoodName(food.description),
        brand: food.brandOwner,
        category: 'USDA Database',
        servingSize,
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
      };
    })
    .filter(food => food.calories > 0)
    .slice(0, 10);
}

// Format food name to be more readable
function formatFoodName(name: string): string {
  return name
    .split(',')[0]
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
