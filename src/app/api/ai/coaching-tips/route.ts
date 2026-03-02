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

interface TipRequest {
  habits: HabitData[];
  goals: GoalData[];
  section: 'habits' | 'goals';
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
  if (data.section === 'habits') {
    const habitsList = data.habits.map(h =>
      `- "${h.name}": ${h.completedToday ? 'completed today' : 'not done today'}, ${h.weeklyRate}% weekly completion, ${h.streak}-day streak`
    ).join('\n');

    return `You are a fitness and habit coach who specializes in James Clear's Atomic Habits methodology. A client has the following daily habits they're tracking:

${habitsList}

Based on their specific habits and progress data, provide 3-4 personalized, actionable coaching tips. Apply these Atomic Habits principles:

1. **1% Better Every Day** — small improvements compound. If a habit has low completion, suggest making it smaller/easier rather than using willpower.
2. **Habit Stacking** — "After I [current habit], I will [new habit]." Suggest stacking their existing habits together.
3. **The 4 Laws of Behavior Change** — Make it obvious (visual cues), attractive (pair with something enjoyable), easy (reduce friction, 2-minute rule), satisfying (track progress, reward).
4. **Identity-Based Habits** — Focus on who they want to become, not just what they want to achieve. "I am someone who..."
5. **Never Miss Twice** — If they missed today, that's fine. The goal is never missing two days in a row.

Reference their specific habit names in your tips. Be encouraging and practical.

Return as JSON:
\`\`\`json
{
  "tips": [
    {
      "title": "Short catchy title",
      "tip": "2-3 sentence explanation using Atomic Habits principles, referencing their specific habits",
      "actionStep": "One specific, concrete action they can take today or tomorrow"
    }
  ]
}
\`\`\``;
  } else {
    const goalsList = data.goals.map(g => {
      const currentStr = g.currentValue !== null ? `current: ${g.currentValue}` : 'no measurements yet';
      const dateStr = g.targetDate ? `target date: ${g.targetDate}` : 'no deadline set';
      return `- "${g.title}" (${g.goalType}): target ${g.targetValue}, ${currentStr}, ${g.progress}% complete, ${dateStr}`;
    }).join('\n');

    return `You are a fitness and goal-setting coach who specializes in James Clear's Atomic Habits methodology. A client has these fitness goals:

${goalsList}

Based on their specific goals and progress, provide 3-4 personalized, actionable coaching tips. Apply these principles:

1. **1% Better Every Day** — break the goal into tiny daily actions. What's the smallest thing they can do today that moves them 1% closer?
2. **Process Over Outcome** — Focus on the system/process (daily actions) rather than fixating on the end number. "You don't rise to the level of your goals, you fall to the level of your systems."
3. **Identity-Based Change** — Help them see themselves as the person who has already achieved this. "I am an athlete" not "I want to lose weight."
4. **Small Milestones** — Break their target into micro-goals they can celebrate along the way.
5. **Environment Design** — Suggest specific changes to their environment that make progress easier and setbacks harder.

Reference their specific goal names and numbers. Be encouraging, specific, and practical.

Return as JSON:
\`\`\`json
{
  "tips": [
    {
      "title": "Short catchy title",
      "tip": "2-3 sentence explanation using Atomic Habits principles, referencing their specific goals and numbers",
      "actionStep": "One specific, concrete action they can take today or tomorrow"
    }
  ]
}
\`\`\``;
  }
}
