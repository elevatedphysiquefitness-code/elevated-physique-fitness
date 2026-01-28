import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface FoodRequest {
  goal: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  dietaryPreferences?: string[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all';
}

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
  prep_time_minutes: number;
  meal_type: string;
}

export async function POST(request: Request) {
  try {
    // Get user from cookies
    const cookieHeader = request.headers.get('cookie');

    const { createServerClient } = await import('@supabase/ssr');
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies: { name: string; value: string }[] = [];
            if (cookieHeader) {
              cookieHeader.split(';').forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                  cookies.push({ name, value });
                }
              });
            }
            return cookies;
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: FoodRequest = await request.json();

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Fetch available foods from database for reference
    const { data: foods } = await supabase
      .from('foods')
      .select('*')
      .limit(50);

    // Build the prompt
    const prompt = buildFoodPrompt(body, foods || []);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text content
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/```json\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const suggestions: { meals: MealSuggestion[] } = JSON.parse(jsonMatch[1]);

    return NextResponse.json({ success: true, meals: suggestions.meals });
  } catch (error) {
    console.error('Error generating food recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate food recommendations' },
      { status: 500 }
    );
  }
}

function buildFoodPrompt(data: FoodRequest, foods: any[]): string {
  const goalDescriptions: Record<string, string> = {
    fat_loss: 'fat loss (calorie deficit, high protein)',
    muscle_gain: 'muscle building (calorie surplus, high protein)',
    maintenance: 'maintenance (balanced macros)',
    recomposition: 'body recomposition (moderate calories, high protein)',
  };

  const goalDesc = goalDescriptions[data.goal] || 'general fitness';

  let dietaryNote = '';
  if (data.dietaryPreferences && data.dietaryPreferences.length > 0) {
    dietaryNote = `\n- Dietary preferences: ${data.dietaryPreferences.join(', ')}`;
  }

  const foodList = foods.length > 0
    ? `\n\nAvailable foods in our database for reference:\n${foods.map(f => `- ${f.name}: ${f.calories_per_serving} cal, ${f.protein_per_serving}g protein (${f.serving_size})`).join('\n')}`
    : '';

  const mealTypeInstruction = data.mealType && data.mealType !== 'all'
    ? `Generate 3 ${data.mealType} suggestions.`
    : 'Generate 1 breakfast, 1 lunch, 1 dinner, and 1 snack suggestion.';

  return `You are a nutrition expert helping a fitness client with meal recommendations.

**Client Profile:**
- Goal: ${goalDesc}
- Daily Targets: ${data.targetCalories} calories, ${data.targetProtein}g protein, ${data.targetCarbs}g carbs, ${data.targetFat}g fat${dietaryNote}

**Task:**
${mealTypeInstruction}

Each meal should:
1. Be practical and easy to prepare
2. Use common, accessible ingredients
3. Fit within the client's macro targets (meals should be appropriately sized portions of daily totals)
4. Be appropriate for the client's fitness goal
5. Include specific quantities for ingredients
${foodList}

**Output Format:**
Return meals as a JSON object:

\`\`\`json
{
  "meals": [
    {
      "name": "Meal Name",
      "description": "Brief description",
      "calories": 450,
      "protein": 35,
      "carbs": 40,
      "fat": 15,
      "ingredients": ["8 oz chicken breast", "1 cup brown rice", "1 cup broccoli"],
      "instructions": "Step-by-step cooking instructions",
      "prep_time_minutes": 25,
      "meal_type": "lunch"
    }
  ]
}
\`\`\`

Generate practical, delicious meal suggestions now:`;
}
