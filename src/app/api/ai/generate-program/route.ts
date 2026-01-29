import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ProgramRequest {
  programId: string;
  programType: string;
  fitnessLevel: string;
  daysPerWeek: number;
  equipment: string;
  focusAreas: string[];
  durationWeeks: number;
}

interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  muscle_group: string;
}

interface GeneratedWorkoutDay {
  day_number: number;
  name: string;
  focus: string;
  description: string;
  duration_minutes: number;
  exercises: GeneratedExercise[];
}

interface GeneratedProgram {
  name: string;
  description: string;
  workout_days: GeneratedWorkoutDay[];
}

export async function POST(request: Request) {
  try {
    // Get user from cookie
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

    // Check if user is admin
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body: ProgramRequest = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Get available exercises from database
    const { data: exercises } = await supabase
      .from('exercises')
      .select('name, muscle_group, equipment')
      .order('muscle_group');

    // Build the prompt
    const prompt = buildProgramPrompt(body, exercises || []);

    // Call Claude API
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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
      console.error('AI Response:', textContent.text);
      throw new Error('Could not parse AI response');
    }

    const generatedProgram: GeneratedProgram = JSON.parse(jsonMatch[1]);

    // Save to database
    await saveProgramWorkouts(body.programId, user.id, generatedProgram, supabase);

    // Update program metadata
    await supabase
      .from('workout_programs')
      .update({
        description: generatedProgram.description,
        duration_weeks: body.durationWeeks,
        program_type: body.programType,
        days_per_week: body.daysPerWeek,
      })
      .eq('id', body.programId);

    return NextResponse.json({ success: true, program: generatedProgram });
  } catch (error) {
    console.error('Error generating program:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to generate program: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function buildProgramPrompt(data: ProgramRequest, exercises: any[]): string {
  const programTypes: Record<string, string> = {
    strength: 'strength building with progressive overload, compound movements, and lower rep ranges (3-6)',
    hypertrophy: 'muscle hypertrophy with moderate weights, higher volume, and 8-12 rep ranges',
    fat_loss: 'fat loss with circuit-style training, supersets, shorter rest periods, and metabolic conditioning',
    endurance: 'muscular endurance with higher reps (15-20), shorter rest, and cardio integration',
    powerlifting: 'powerlifting focused on squat, bench, deadlift with accessories',
    athletic: 'athletic performance with explosive movements, plyometrics, and functional training',
    general: 'general fitness with balanced approach covering strength, cardio, and mobility',
  };

  const equipmentTypes: Record<string, string> = {
    commercial_gym: 'full commercial gym (barbells, dumbbells, cables, machines, cardio equipment)',
    home_gym: 'home gym setup (barbells, dumbbells, bench, squat rack)',
    minimal: 'minimal equipment (dumbbells and resistance bands only)',
    bodyweight: 'bodyweight only (no equipment)',
  };

  const levelDescriptions: Record<string, string> = {
    beginner: 'beginner (focus on form, simple movements, lower volume)',
    intermediate: 'intermediate (moderate complexity and volume)',
    advanced: 'advanced (high volume, complex movements, intensity techniques)',
  };

  const focusDesc = data.focusAreas.map(f => f.replace('_', ' ')).join(', ');
  const programDesc = programTypes[data.programType] || 'general fitness';
  const equipmentDesc = equipmentTypes[data.equipment] || 'commercial gym';
  const levelDesc = levelDescriptions[data.fitnessLevel] || 'intermediate';

  // Build exercise list by muscle group
  const exerciseList = exercises.reduce((acc: Record<string, string[]>, ex: any) => {
    const group = ex.muscle_group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex.name);
    return acc;
  }, {});

  const exerciseListStr = Object.entries(exerciseList)
    .map(([group, exs]) => `${group}: ${(exs as string[]).slice(0, 10).join(', ')}`)
    .join('\n');

  return `You are an expert fitness coach creating a workout program. Generate a ${data.daysPerWeek}-day per week program.

**Program Requirements:**
- Type: ${programDesc}
- Fitness Level: ${levelDesc}
- Days Per Week: ${data.daysPerWeek}
- Available Equipment: ${equipmentDesc}
- Focus Areas: ${focusDesc || 'full body balanced'}

**Exercise Library (use ONLY these exact names when available):**
${exerciseListStr}

**Guidelines:**
1. Create exactly ${data.daysPerWeek} workout days
2. Each day should have 5-8 exercises
3. Use exercises from the library above (exact names) when possible
4. Include appropriate sets (2-5), reps, and rest periods based on the program type
5. Progress logically through the week (e.g., Push/Pull/Legs or Upper/Lower splits)
6. Include warmup notes where appropriate
7. Match exercise selection to available equipment

**Output Format:**
Return ONLY a JSON object (no additional text):

\`\`\`json
{
  "name": "Program Name",
  "description": "Brief description of the program and its goals",
  "workout_days": [
    {
      "day_number": 1,
      "name": "Day Name (e.g., Push Day, Upper Body A)",
      "focus": "Primary muscle groups",
      "description": "Brief description",
      "duration_minutes": 45,
      "exercises": [
        {
          "name": "Exercise Name (from library)",
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 90,
          "notes": "Coaching cues",
          "muscle_group": "Chest"
        }
      ]
    }
  ]
}
\`\`\`

Generate the complete program now:`;
}

async function saveProgramWorkouts(
  programId: string,
  userId: string,
  program: GeneratedProgram,
  supabase: any
) {
  // Delete existing templates for this program
  await supabase
    .from('workout_templates')
    .delete()
    .eq('program_id', programId);

  // Create workout templates for each day
  for (const day of program.workout_days) {
    // Create workout template
    const { data: templateData, error: templateError } = await supabase
      .from('workout_templates')
      .insert({
        name: day.name,
        title: day.name,
        description: day.description,
        focus: day.focus,
        duration_minutes: day.duration_minutes,
        day_number: day.day_number,
        program_id: programId,
        created_by: userId,
        is_ai_generated: true,
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error creating template:', templateError);
      continue;
    }

    // Create exercises for this template
    for (let i = 0; i < day.exercises.length; i++) {
      const exercise = day.exercises[i];

      // Find exercise in database (case-insensitive)
      let { data: existingExercise } = await supabase
        .from('exercises')
        .select('id')
        .ilike('name', exercise.name)
        .single();

      let exerciseId: string;

      if (existingExercise) {
        exerciseId = existingExercise.id;
      } else {
        // Create new exercise if not found
        const { data: newExercise, error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            description: exercise.notes,
          })
          .select()
          .single();

        if (exerciseError) {
          console.error('Error creating exercise:', exerciseError);
          continue;
        }
        exerciseId = newExercise.id;
      }

      // Create template exercise
      await supabase
        .from('workout_template_exercises')
        .insert({
          template_id: templateData.id,
          exercise_id: exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.rest_seconds,
          notes: exercise.notes,
          order_index: i,
        });
    }
  }
}
