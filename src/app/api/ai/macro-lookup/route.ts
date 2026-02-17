import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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

    const { foodName, quantity } = await request.json();

    if (!foodName) {
      return NextResponse.json({ success: false, error: 'Food name is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured.' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are a nutrition database. Given a food item and optional quantity, return the accurate nutritional information.

Food: "${foodName}"${quantity ? `\nQuantity: ${quantity}` : ''}

If a quantity is provided, calculate macros for that specific amount.
If no quantity is provided, use a standard single serving size.

Return ONLY a JSON object with no extra text, no markdown code fences:
{"serving_size":"the serving size used","calories":number,"protein":number,"carbs":number,"fat":number}

Use realistic nutritional data. Round to whole numbers for calories, one decimal for macros. Do not include any explanation.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Try parsing the response directly as JSON first, then try extracting from code fences
    let parsed;
    try {
      parsed = JSON.parse(textContent.text.trim());
    } catch {
      const jsonMatch = textContent.text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try finding a JSON object in the text
        const objMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (objMatch) {
          parsed = JSON.parse(objMatch[0]);
        } else {
          throw new Error('Could not parse AI response');
        }
      }
    }

    return NextResponse.json({
      success: true,
      nutrition: {
        serving_size: parsed.serving_size || '',
        calories: Math.round(parsed.calories || 0),
        protein: parseFloat((parsed.protein || 0).toFixed(1)),
        carbs: parseFloat((parsed.carbs || 0).toFixed(1)),
        fat: parseFloat((parsed.fat || 0).toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Error looking up macros:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to look up nutritional information' },
      { status: 500 }
    );
  }
}
