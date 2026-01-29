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

interface WorkoutRequest {
  fitnessGoals: string[];
  bodyPartGoals: string[];
  fitnessLevel: string;
  availableEquipment: string;
  trainingDays: number;
  injuries: string[];
  medicalConditions: string[];
  isPregnant: boolean;
  additionalNotes: string;
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
  duration_weeks: number;
  workout_days: GeneratedWorkoutDay[];
}

export async function POST(request: Request) {
  try {
    // Get user from authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    // Create a Supabase client with the auth context
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

    const body: WorkoutRequest = await request.json();

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Build the prompt
    const prompt = buildWorkoutPrompt(body);

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
      throw new Error('Could not parse AI response');
    }

    const generatedProgram: GeneratedProgram = JSON.parse(jsonMatch[1]);

    // Save to database
    await saveGeneratedProgram(user.id, generatedProgram, body);

    return NextResponse.json({ success: true, program: generatedProgram });
  } catch (error) {
    console.error('Error generating workout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to generate workout program: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function buildWorkoutPrompt(data: WorkoutRequest): string {
  const goalDescriptions: Record<string, string> = {
    fat_loss: 'fat loss and calorie burning',
    muscle_gain: 'building lean muscle mass',
    strength: 'increasing strength and power',
    recomposition: 'body recomposition (lose fat, build muscle)',
    endurance: 'improving cardiovascular endurance',
    general_fitness: 'overall fitness and health',
  };

  const bodyPartDescriptions: Record<string, string> = {
    chest: 'chest',
    back: 'back',
    shoulders: 'shoulders',
    arms: 'arms (biceps and triceps)',
    legs: 'legs (quads and hamstrings)',
    glutes: 'glutes',
    core: 'core and abs',
    full_body: 'balanced full body development',
  };

  const equipmentDescriptions: Record<string, string> = {
    commercial_gym: 'full commercial gym with all equipment (barbells, dumbbells, cables, machines)',
    home_gym: 'home gym with barbells, dumbbells, bench, and squat rack',
    minimal: 'minimal equipment (dumbbells and resistance bands only)',
    bodyweight: 'bodyweight exercises only (no equipment)',
  };

  const levelDescriptions: Record<string, string> = {
    beginner: 'beginner (0-6 months of training experience)',
    intermediate: 'intermediate (6 months to 2 years of training)',
    advanced: 'advanced (2+ years of consistent training)',
  };

  const goals = data.fitnessGoals.map(g => goalDescriptions[g] || g).join(', ');
  const bodyParts = data.bodyPartGoals.map(b => bodyPartDescriptions[b] || b).join(', ');
  const equipment = equipmentDescriptions[data.availableEquipment] || data.availableEquipment;
  const level = levelDescriptions[data.fitnessLevel] || data.fitnessLevel;

  let healthConsiderations = '';
  if (data.injuries.length > 0) {
    healthConsiderations += `\n- Injuries to avoid aggravating: ${data.injuries.join(', ')}`;
  }
  if (data.medicalConditions.length > 0) {
    healthConsiderations += `\n- Medical conditions to consider: ${data.medicalConditions.join(', ')}`;
  }
  if (data.isPregnant) {
    healthConsiderations += '\n- Client is pregnant - avoid exercises contraindicated during pregnancy';
  }

  return `You are an expert fitness coach and personal trainer. Create a comprehensive ${data.trainingDays}-day per week workout program based on the following client profile:

**Client Profile:**
- Primary Goals: ${goals}
- Focus Areas: ${bodyParts}
- Experience Level: ${level}
- Available Equipment: ${equipment}
- Training Days per Week: ${data.trainingDays}
${healthConsiderations ? `\n**Health Considerations:**${healthConsiderations}` : ''}
${data.additionalNotes ? `\n**Additional Notes from Client:** ${data.additionalNotes}` : ''}

**Requirements:**
1. Create a structured program appropriate for the client's experience level
2. Each workout day should have 4-8 exercises
3. Include appropriate sets, reps, and rest periods based on goals
4. AVOID any exercises that could aggravate the client's injuries or medical conditions
5. If pregnant, only include pregnancy-safe exercises
6. Include a mix of compound and isolation movements appropriate for the equipment available
7. Add coaching notes for key exercises

**Output Format:**
Return the program as a JSON object with the following structure:

\`\`\`json
{
  "name": "Program Name",
  "description": "Brief description of the program",
  "duration_weeks": 4,
  "workout_days": [
    {
      "day_number": 1,
      "name": "Day Name (e.g., Upper Body A)",
      "focus": "Primary muscle groups targeted",
      "description": "Brief description of this workout",
      "duration_minutes": 45,
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 90,
          "notes": "Coaching cues or modifications",
          "muscle_group": "chest"
        }
      ]
    }
  ]
}
\`\`\`

Generate a complete, professional workout program now:`;
}

async function saveGeneratedProgram(
  userId: string,
  program: GeneratedProgram,
  requestData: WorkoutRequest
) {
  // Create the workout program
  const supabase = getSupabaseClient();
  const { data: programData, error: programError } = await supabase
    .from('workout_programs')
    .insert({
      title: program.name,
      description: program.description,
      duration_weeks: program.duration_weeks,
      created_by: userId,
      is_ai_generated: true,
    })
    .select()
    .single();

  if (programError) {
    console.error('Error creating program:', programError);
    throw programError;
  }

  // Create workout templates for each day
  for (const day of program.workout_days) {
    // Create workout template
    const { data: templateData, error: templateError } = await supabase
      .from('workout_templates')
      .insert({
        name: day.name,
        description: day.description,
        focus: day.focus,
        duration_minutes: day.duration_minutes,
        is_ai_generated: true,
        ai_prompt: JSON.stringify(requestData),
        created_for_client_id: userId,
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error creating template:', templateError);
      continue;
    }

    // Create exercises and template exercises
    for (let i = 0; i < day.exercises.length; i++) {
      const exercise = day.exercises[i];

      // Check if exercise already exists
      let { data: existingExercise } = await supabase
        .from('exercises')
        .select('id')
        .ilike('name', exercise.name)
        .single();

      let exerciseId: string;

      if (existingExercise) {
        exerciseId = existingExercise.id;
      } else {
        // Create new exercise
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
          order_index: i + 1,
        });
    }
  }

  // Assign program to client
  const startDate = new Date();
  const { error: assignError } = await supabase
    .from('client_programs')
    .insert({
      client_id: userId,
      program_id: programData.id,
      program_name: program.name,
      start_date: startDate.toISOString().split('T')[0],
      current_week: 1,
      total_weeks: program.duration_weeks,
      status: 'active',
      is_custom: true,
    });

  if (assignError) {
    console.error('Error assigning program:', assignError);
  }

  // Create assigned workouts for the first week
  const dayOfWeek = startDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(startDate);
  nextMonday.setDate(startDate.getDate() + mondayOffset);

  // Get all templates for this program
  const { data: templates } = await supabase
    .from('workout_templates')
    .select('id')
    .eq('created_for_client_id', userId)
    .eq('is_ai_generated', true)
    .order('created_at', { ascending: false })
    .limit(program.workout_days.length);

  if (templates) {
    for (let i = 0; i < templates.length; i++) {
      const workoutDate = new Date(nextMonday);
      workoutDate.setDate(nextMonday.getDate() + i);

      await supabase
        .from('assigned_workouts')
        .insert({
          client_id: userId,
          template_id: templates[i].id,
          workout_date: workoutDate.toISOString().split('T')[0],
          status: 'scheduled',
        });
    }
  }
}
