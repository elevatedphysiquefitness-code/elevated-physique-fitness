-- Add Booty Building Program with Auto-Assignment Support
-- Run this in Supabase SQL Editor

-- First, create the Booty Building program
INSERT INTO workout_programs (id, title, description, duration_weeks, program_type, days_per_week, is_ai_generated)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Booty Building',
  'A comprehensive glute-focused program designed to build, shape, and strengthen your glutes. Combines hip thrusts, squats, lunges, and isolation movements for maximum glute development.',
  8,
  'hypertrophy',
  3,
  false
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_weeks = EXCLUDED.duration_weeks,
  program_type = EXCLUDED.program_type,
  days_per_week = EXCLUDED.days_per_week;

-- Create workout templates for each day
-- Day 1: Glute Focus - Hip Hinge
INSERT INTO workout_templates (id, name, title, description, focus, duration_minutes, day_number, program_id)
VALUES (
  '00000000-0000-0000-0001-000000000001',
  'Glute Builder A - Hip Hinge',
  'Glute Builder A - Hip Hinge',
  'Focus on hip hinge movements to target the glutes and hamstrings',
  'Glutes, Hamstrings',
  45,
  1,
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  focus = EXCLUDED.focus;

-- Day 2: Glute Focus - Squat Variations
INSERT INTO workout_templates (id, name, title, description, focus, duration_minutes, day_number, program_id)
VALUES (
  '00000000-0000-0000-0001-000000000002',
  'Glute Builder B - Squat Variations',
  'Glute Builder B - Squat Variations',
  'Squat variations to build glute strength and size',
  'Glutes, Quads',
  45,
  2,
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  focus = EXCLUDED.focus;

-- Day 3: Glute Focus - Isolation & Activation
INSERT INTO workout_templates (id, name, title, description, focus, duration_minutes, day_number, program_id)
VALUES (
  '00000000-0000-0000-0001-000000000003',
  'Glute Builder C - Isolation',
  'Glute Builder C - Isolation',
  'Isolation exercises for maximum glute pump and activation',
  'Glutes',
  40,
  3,
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  focus = EXCLUDED.focus;

-- Now add exercises to each template
-- We need to find exercise IDs first

-- Day 1 Exercises: Hip Thrust, Romanian Deadlift, Cable Kickback, Glute Bridge, Good Mornings
DO $$
DECLARE
  template_id_1 UUID := '00000000-0000-0000-0001-000000000001';
  hip_thrust_id UUID;
  rdl_id UUID;
  cable_kickback_id UUID;
  glute_bridge_id UUID;
  good_mornings_id UUID;
  sumo_dl_id UUID;
BEGIN
  -- Get exercise IDs (using case-insensitive search)
  SELECT id INTO hip_thrust_id FROM exercises WHERE LOWER(name) LIKE '%hip thrust%' LIMIT 1;
  SELECT id INTO rdl_id FROM exercises WHERE LOWER(name) LIKE '%romanian deadlift%' LIMIT 1;
  SELECT id INTO cable_kickback_id FROM exercises WHERE LOWER(name) LIKE '%cable kickback%' LIMIT 1;
  SELECT id INTO glute_bridge_id FROM exercises WHERE LOWER(name) LIKE '%glute bridge%' LIMIT 1;
  SELECT id INTO good_mornings_id FROM exercises WHERE LOWER(name) LIKE '%good morning%' LIMIT 1;
  SELECT id INTO sumo_dl_id FROM exercises WHERE LOWER(name) LIKE '%sumo deadlift%' LIMIT 1;

  -- Delete existing template exercises for this template
  DELETE FROM workout_template_exercises WHERE template_id = template_id_1;

  -- Insert exercises for Day 1
  IF hip_thrust_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_1, hip_thrust_id, 4, '10-12', 90, 'Squeeze glutes hard at the top. Pause for 2 seconds.', 1);
  END IF;

  IF rdl_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_1, rdl_id, 4, '10-12', 90, 'Feel the stretch in hamstrings, squeeze glutes to come up.', 2);
  END IF;

  IF sumo_dl_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_1, sumo_dl_id, 3, '8-10', 120, 'Wide stance, toes pointed out, drive through heels.', 3);
  END IF;

  IF cable_kickback_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_1, cable_kickback_id, 3, '12-15', 60, 'Slow and controlled. Focus on glute contraction.', 4);
  END IF;

  IF glute_bridge_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_1, glute_bridge_id, 3, '15-20', 45, 'Burnout set. Hold at top for 1 second each rep.', 5);
  END IF;
END $$;

-- Day 2 Exercises: Bulgarian Split Squat, Goblet Squat, Sumo Squat, Step-Ups, Lunges
DO $$
DECLARE
  template_id_2 UUID := '00000000-0000-0000-0001-000000000002';
  bss_id UUID;
  goblet_id UUID;
  sumo_sq_id UUID;
  step_ups_id UUID;
  lunges_id UUID;
  leg_press_id UUID;
BEGIN
  SELECT id INTO bss_id FROM exercises WHERE LOWER(name) LIKE '%bulgarian split squat%' LIMIT 1;
  SELECT id INTO goblet_id FROM exercises WHERE LOWER(name) LIKE '%goblet squat%' LIMIT 1;
  SELECT id INTO sumo_sq_id FROM exercises WHERE LOWER(name) LIKE '%sumo squat%' LIMIT 1;
  SELECT id INTO step_ups_id FROM exercises WHERE LOWER(name) LIKE '%step%up%' OR LOWER(name) LIKE '%step up%' LIMIT 1;
  SELECT id INTO lunges_id FROM exercises WHERE LOWER(name) LIKE '%lunge%' AND LOWER(name) NOT LIKE '%curtsy%' LIMIT 1;
  SELECT id INTO leg_press_id FROM exercises WHERE LOWER(name) LIKE '%leg press%' LIMIT 1;

  DELETE FROM workout_template_exercises WHERE template_id = template_id_2;

  IF bss_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_2, bss_id, 4, '10-12', 90, 'Each leg. Keep torso upright, drive through front heel.', 1);
  END IF;

  IF goblet_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_2, goblet_id, 4, '12-15', 75, 'Deep squat position, push knees out.', 2);
  END IF;

  IF leg_press_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_2, leg_press_id, 3, '12-15', 90, 'Feet high and wide on platform for glute emphasis.', 3);
  END IF;

  IF step_ups_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_2, step_ups_id, 3, '12', 60, 'Each leg. Use a challenging box height.', 4);
  END IF;

  IF lunges_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_2, lunges_id, 3, '12', 60, 'Walking lunges preferred. Long strides for glute stretch.', 5);
  END IF;
END $$;

-- Day 3 Exercises: Frog Pumps, Fire Hydrants, Donkey Kicks, Clamshells, Cable Pull Through, Single Leg RDL
DO $$
DECLARE
  template_id_3 UUID := '00000000-0000-0000-0001-000000000003';
  frog_id UUID;
  fire_hydrant_id UUID;
  donkey_kick_id UUID;
  clamshell_id UUID;
  pull_through_id UUID;
  sl_rdl_id UUID;
  hip_thrust_id UUID;
BEGIN
  SELECT id INTO frog_id FROM exercises WHERE LOWER(name) LIKE '%frog pump%' LIMIT 1;
  SELECT id INTO fire_hydrant_id FROM exercises WHERE LOWER(name) LIKE '%fire hydrant%' LIMIT 1;
  SELECT id INTO donkey_kick_id FROM exercises WHERE LOWER(name) LIKE '%donkey kick%' LIMIT 1;
  SELECT id INTO clamshell_id FROM exercises WHERE LOWER(name) LIKE '%clamshell%' LIMIT 1;
  SELECT id INTO pull_through_id FROM exercises WHERE LOWER(name) LIKE '%cable pull through%' LIMIT 1;
  SELECT id INTO sl_rdl_id FROM exercises WHERE LOWER(name) LIKE '%single leg%deadlift%' OR LOWER(name) LIKE '%single leg romanian%' LIMIT 1;
  SELECT id INTO hip_thrust_id FROM exercises WHERE LOWER(name) LIKE '%hip thrust%' LIMIT 1;

  DELETE FROM workout_template_exercises WHERE template_id = template_id_3;

  -- Start with activation work
  IF frog_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_3, frog_id, 3, '20', 30, 'Activation exercise. Focus on squeezing glutes.', 1);
  END IF;

  IF clamshell_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_3, clamshell_id, 3, '15', 30, 'Each side. Use band for added resistance.', 2);
  END IF;

  IF pull_through_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_3, pull_through_id, 4, '12-15', 60, 'Squeeze hard at the top. Feel the glutes engage.', 3);
  END IF;

  IF sl_rdl_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_3, sl_rdl_id, 3, '10', 60, 'Each leg. Great for balance and glute isolation.', 4);
  END IF;

  IF fire_hydrant_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_3, fire_hydrant_id, 3, '15', 30, 'Each side. Controlled movement, feel the burn.', 5);
  END IF;

  IF donkey_kick_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_3, donkey_kick_id, 3, '15', 30, 'Each side. Keep core tight.', 6);
  END IF;

  -- End with burnout
  IF hip_thrust_id IS NOT NULL THEN
    INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, rest_seconds, notes, order_index)
    VALUES (template_id_3, hip_thrust_id, 2, '20', 45, 'Burnout! Lighter weight, higher reps.', 7);
  END IF;
END $$;

-- Verify the program was created
SELECT
  wp.title as program,
  wt.name as workout_day,
  e.name as exercise,
  wte.sets,
  wte.reps,
  wte.notes
FROM workout_programs wp
JOIN workout_templates wt ON wt.program_id = wp.id
JOIN workout_template_exercises wte ON wte.template_id = wt.id
JOIN exercises e ON e.id = wte.exercise_id
WHERE wp.id = '00000000-0000-0000-0000-000000000001'
ORDER BY wt.day_number, wte.order_index;
