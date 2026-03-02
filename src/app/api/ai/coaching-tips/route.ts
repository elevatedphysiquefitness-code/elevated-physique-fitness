import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

interface HabitData {
  name: string;
  completedToday: boolean;
  weeklyRate: number;
  streak: number;
}

interface GoalData {
  title: string;
  goalType: string;
  targetValue: number;
  currentValue: number | null;
  progress: number;
  targetDate: string | null;
}

interface NutritionData {
  goal: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  recentFoods: string[];
}

interface TipRequest {
  habits: HabitData[];
  goals: GoalData[];
  nutrition?: NutritionData;
  section: 'habits' | 'goals' | 'nutrition';
}

export async function POST(request: Request) {
  try {
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
                const trimmed = cookie.trim();
                const idx = trimmed.indexOf('=');
                if (idx > 0) {
                  const name = trimmed.substring(0, idx);
                  const value = trimmed.substring(idx + 1);
                  if (name && value) {
                    cookies.push({ name, value });
                  }
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

    const body: TipRequest = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(body);

    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    const jsonMatch = textContent.text.match(/```json\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const result: { tips: { title: string; tip: string; actionStep: string }[] } = JSON.parse(jsonMatch[1]);

    return NextResponse.json({ success: true, tips: result.tips });
  } catch (error) {
    console.error('Error generating coaching tips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate coaching tips' },
      { status: 500 }
    );
  }
}

function buildPrompt(data: TipRequest): string {
  const jsonExample = '```json\n{\n  "tips": [\n    {\n      "title": "Short catchy title",\n      "tip": "2-3 sentence explanation",\n      "actionStep": "One specific action"\n    }\n  ]\n}\n```';

  if (data.section === 'habits') {
    const habitsList = data.habits.map(h =>
      '- "' + h.name + '": ' + (h.completedToday ? 'completed today' : 'not done today') + ', ' + h.weeklyRate + '% weekly completion, ' + h.streak + '-day streak'
    ).join('\n');

    return 'You are a fitness and habit coach who specializes in James Clear\'s Atomic Habits methodology. A client has the following daily habits they\'re tracking:\n\n' +
      habitsList + '\n\n' +
      'Based on their specific habits and progress data, provide 3-4 personalized, actionable coaching tips. Apply these Atomic Habits principles:\n\n' +
      '1. **1% Better Every Day** — small improvements compound. If a habit has low completion, suggest making it smaller/easier rather than using willpower.\n' +
      '2. **Habit Stacking** — "After I [current habit], I will [new habit]." Suggest stacking their existing habits together.\n' +
      '3. **The 4 Laws of Behavior Change** — Make it obvious (visual cues), attractive (pair with something enjoyable), easy (reduce friction, 2-minute rule), satisfying (track progress, reward).\n' +
      '4. **Identity-Based Habits** — Focus on who they want to become, not just what they want to achieve. "I am someone who..."\n' +
      '5. **Never Miss Twice** — If they missed today, that\'s fine. The goal is never missing two days in a row.\n\n' +
      'Reference their specific habit names in your tips. Be encouraging and practical.\n\n' +
      'Return as JSON:\n' + jsonExample;

  } else if (data.section === 'goals') {
    const goalsList = data.goals.map(g => {
      const currentStr = g.currentValue !== null ? 'current: ' + g.currentValue : 'no measurements yet';
      const dateStr = g.targetDate ? 'target date: ' + g.targetDate : 'no deadline set';
      return '- "' + g.title + '" (' + g.goalType + '): target ' + g.targetValue + ', ' + currentStr + ', ' + g.progress + '% complete, ' + dateStr;
    }).join('\n');

    return 'You are a fitness and goal-setting coach who specializes in James Clear\'s Atomic Habits methodology. A client has these fitness goals:\n\n' +
      goalsList + '\n\n' +
      'Based on their specific goals and progress, provide 3-4 personalized, actionable coaching tips. Apply these principles:\n\n' +
      '1. **1% Better Every Day** — break the goal into tiny daily actions. What\'s the smallest thing they can do today that moves them 1% closer?\n' +
      '2. **Process Over Outcome** — Focus on the system/process (daily actions) rather than fixating on the end number.\n' +
      '3. **Identity-Based Change** — Help them see themselves as the person who has already achieved this. "I am an athlete" not "I want to lose weight."\n' +
      '4. **Small Milestones** — Break their target into micro-goals they can celebrate along the way.\n' +
      '5. **Environment Design** — Suggest specific changes to their environment that make progress easier and setbacks harder.\n\n' +
      'Reference their specific goal names and numbers. Be encouraging, specific, and practical.\n\n' +
      'Return as JSON:\n' + jsonExample;

  } else if (data.section === 'nutrition' && data.nutrition) {
    const n = data.nutrition;
    const recentFoodsList = n.recentFoods.length > 0
      ? '\n\nRecent foods logged today:\n' + n.recentFoods.map(f => '- ' + f).join('\n')
      : '\n\nNo foods logged today yet.';

    return 'You are a nutrition coach who specializes in James Clear\'s Atomic Habits methodology applied to eating habits. A fitness client has the following nutrition profile:\n\n' +
      '**Goal:** ' + n.goal + '\n' +
      '**Daily Macro Targets:** ' + n.targetCalories + ' cal, ' + n.targetProtein + 'g protein, ' + n.targetCarbs + 'g carbs, ' + n.targetFat + 'g fat\n' +
      '**Consumed Today:** ' + n.consumedCalories + ' cal, ' + n.consumedProtein + 'g protein, ' + n.consumedCarbs + 'g carbs, ' + n.consumedFat + 'g fat' +
      recentFoodsList + '\n\n' +
      'Based on their nutrition data and what they\'ve eaten today, provide 3-4 personalized, actionable tips. Apply these Atomic Habits principles to nutrition:\n\n' +
      '1. **1% Better Every Day** — small nutritional improvements that compound. Don\'t overhaul their diet overnight; suggest one small swap or addition.\n' +
      '2. **Habit Stacking for Nutrition** — "After I [existing routine], I will [nutrition habit]." E.g., "After I pour my morning coffee, I will drink a glass of water first."\n' +
      '3. **Make It Easy** — reduce friction for healthy eating (meal prep, keep healthy snacks visible, pre-portion meals).\n' +
      '4. **Environment Design** — redesign their kitchen/workspace to make good nutrition the default.\n' +
      '5. **Never Miss Twice** — if they had a bad meal, the next one should be a win. One off-plan meal doesn\'t derail progress.\n\n' +
      'Reference their specific macro numbers and foods. If they\'re under/over on certain macros, give specific food suggestions to close the gap. Be encouraging and practical.\n\n' +
      'Return as JSON:\n' + jsonExample;
  }

  return 'Provide 3 general fitness tips in JSON format with tips array containing objects with title, tip, and actionStep fields. Wrap in ```json``` code fence.';
}
