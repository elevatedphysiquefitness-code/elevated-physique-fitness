-- Add YouTube video URLs to exercises
-- Run this in the Supabase SQL Editor

-- CHEST EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Barbell Bench Press', 'Chest', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 'The king of chest exercises. Lie on a flat bench and press the barbell from chest level to full arm extension.', 'intermediate', true, ARRAY['Chest', 'Triceps', 'Front Deltoids'], ARRAY['Barbell', 'Bench']),
('Incline Barbell Bench Press', 'Chest', 'https://www.youtube.com/watch?v=SrqOu55lrYU', 'Upper chest focused variation performed on an incline bench (30-45 degrees).', 'intermediate', true, ARRAY['Upper Chest', 'Front Deltoids', 'Triceps'], ARRAY['Barbell', 'Incline Bench']),
('Decline Barbell Bench Press', 'Chest', 'https://www.youtube.com/watch?v=LfyQBUKR8SE', 'Lower chest focused variation performed on a decline bench.', 'intermediate', true, ARRAY['Lower Chest', 'Triceps'], ARRAY['Barbell', 'Decline Bench']),
('Dumbbell Bench Press', 'Chest', 'https://www.youtube.com/watch?v=VmB1G1K7v94', 'Press dumbbells from chest level with a greater range of motion than barbell.', 'beginner', true, ARRAY['Chest', 'Triceps', 'Front Deltoids'], ARRAY['Dumbbells', 'Bench']),
('Incline Dumbbell Press', 'Chest', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', 'Upper chest focused dumbbell pressing movement on an incline bench.', 'beginner', true, ARRAY['Upper Chest', 'Front Deltoids', 'Triceps'], ARRAY['Dumbbells', 'Incline Bench']),
('Dumbbell Flyes', 'Chest', 'https://www.youtube.com/watch?v=eozdVDA78K0', 'Isolation exercise focusing on chest stretch and contraction.', 'beginner', false, ARRAY['Chest'], ARRAY['Dumbbells', 'Bench']),
('Cable Crossover', 'Chest', 'https://www.youtube.com/watch?v=taI4XduLpTk', 'Cable isolation movement for chest with constant tension throughout.', 'beginner', false, ARRAY['Chest'], ARRAY['Cable Machine']),
('Push-Ups', 'Chest', 'https://www.youtube.com/watch?v=IODxDxX7oi4', 'Classic bodyweight exercise for chest, shoulders, and triceps.', 'beginner', true, ARRAY['Chest', 'Triceps', 'Front Deltoids'], ARRAY['None']),
('Incline Push-Ups', 'Chest', 'https://www.youtube.com/watch?v=cfns5VDVVvk', 'Easier push-up variation with hands elevated on a bench or box.', 'beginner', true, ARRAY['Lower Chest', 'Triceps'], ARRAY['Bench']),
('Decline Push-Ups', 'Chest', 'https://www.youtube.com/watch?v=SKPab2YC8BE', 'Harder push-up variation with feet elevated, targeting upper chest.', 'intermediate', true, ARRAY['Upper Chest', 'Front Deltoids', 'Triceps'], ARRAY['Bench']),
('Chest Dips', 'Chest', 'https://www.youtube.com/watch?v=dX_nSOOJIsE', 'Bodyweight dips with forward lean to emphasize chest.', 'intermediate', true, ARRAY['Lower Chest', 'Triceps', 'Front Deltoids'], ARRAY['Dip Bars']),
('Machine Chest Press', 'Chest', 'https://www.youtube.com/watch?v=xUm0BiZCWlQ', 'Machine-based pressing movement for controlled chest work.', 'beginner', true, ARRAY['Chest', 'Triceps', 'Front Deltoids'], ARRAY['Chest Press Machine']),
('Pec Deck Fly', 'Chest', 'https://www.youtube.com/watch?v=Z57CtFmRMxA', 'Machine fly movement for isolated chest contraction.', 'beginner', false, ARRAY['Chest'], ARRAY['Pec Deck Machine'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- BACK EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Barbell Deadlift', 'Back', 'https://www.youtube.com/watch?v=op9kVnSso6Q', 'Fundamental compound movement for posterior chain development.', 'advanced', true, ARRAY['Lower Back', 'Glutes', 'Hamstrings', 'Traps'], ARRAY['Barbell']),
('Romanian Deadlift', 'Back', 'https://www.youtube.com/watch?v=7j-2w4-P14I', 'Hip-hinge movement emphasizing hamstrings and lower back.', 'intermediate', true, ARRAY['Hamstrings', 'Lower Back', 'Glutes'], ARRAY['Barbell']),
('Barbell Row', 'Back', 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', 'Bent-over rowing movement for overall back thickness.', 'intermediate', true, ARRAY['Lats', 'Rhomboids', 'Rear Deltoids', 'Biceps'], ARRAY['Barbell']),
('Dumbbell Row', 'Back', 'https://www.youtube.com/watch?v=pYcpY20QaE8', 'Single-arm rowing for lat development and core stability.', 'beginner', true, ARRAY['Lats', 'Rhomboids', 'Rear Deltoids', 'Biceps'], ARRAY['Dumbbell', 'Bench']),
('Pull-Ups', 'Back', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 'Bodyweight vertical pulling for lat width.', 'intermediate', true, ARRAY['Lats', 'Biceps', 'Rear Deltoids'], ARRAY['Pull-Up Bar']),
('Chin-Ups', 'Back', 'https://www.youtube.com/watch?v=brhRXlOhsAM', 'Underhand grip pull-up variation with more bicep involvement.', 'intermediate', true, ARRAY['Lats', 'Biceps'], ARRAY['Pull-Up Bar']),
('Lat Pulldown', 'Back', 'https://www.youtube.com/watch?v=CAwf7n6Luuc', 'Cable machine exercise mimicking pull-up movement.', 'beginner', true, ARRAY['Lats', 'Biceps', 'Rear Deltoids'], ARRAY['Lat Pulldown Machine']),
('Seated Cable Row', 'Back', 'https://www.youtube.com/watch?v=GZbfZ033f74', 'Horizontal pulling for mid-back thickness.', 'beginner', true, ARRAY['Lats', 'Rhomboids', 'Rear Deltoids', 'Biceps'], ARRAY['Cable Machine']),
('T-Bar Row', 'Back', 'https://www.youtube.com/watch?v=j3Igk5nyZE4', 'Bent-over row variation with T-bar or landmine attachment.', 'intermediate', true, ARRAY['Lats', 'Rhomboids', 'Rear Deltoids'], ARRAY['T-Bar', 'Barbell']),
('Face Pulls', 'Back', 'https://www.youtube.com/watch?v=rep-qVOkqgk', 'Cable exercise for rear deltoids and rotator cuff health.', 'beginner', false, ARRAY['Rear Deltoids', 'Rhomboids', 'Rotator Cuff'], ARRAY['Cable Machine']),
('Inverted Row', 'Back', 'https://www.youtube.com/watch?v=hXTc1mDnZCw', 'Bodyweight horizontal pulling exercise.', 'beginner', true, ARRAY['Lats', 'Rhomboids', 'Biceps'], ARRAY['Barbell', 'Squat Rack']),
('Rack Pulls', 'Back', 'https://www.youtube.com/watch?v=0oeIB6wi3es', 'Partial deadlift from pins for upper back and trap development.', 'intermediate', true, ARRAY['Upper Back', 'Traps', 'Lower Back'], ARRAY['Barbell', 'Power Rack']),
('Straight Arm Pulldown', 'Back', 'https://www.youtube.com/watch?v=AjCCGN2tU3Q', 'Cable isolation for lat engagement and mind-muscle connection.', 'beginner', false, ARRAY['Lats'], ARRAY['Cable Machine'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- SHOULDER EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Overhead Press', 'Shoulders', 'https://www.youtube.com/watch?v=2yjwXTZQDDI', 'Standing barbell press for overall shoulder development.', 'intermediate', true, ARRAY['Front Deltoids', 'Lateral Deltoids', 'Triceps'], ARRAY['Barbell']),
('Seated Dumbbell Press', 'Shoulders', 'https://www.youtube.com/watch?v=qEwKCR5JCog', 'Seated pressing movement with dumbbells for shoulder mass.', 'beginner', true, ARRAY['Front Deltoids', 'Lateral Deltoids', 'Triceps'], ARRAY['Dumbbells', 'Bench']),
('Arnold Press', 'Shoulders', 'https://www.youtube.com/watch?v=6Z15_WdXmVw', 'Rotating dumbbell press variation for full deltoid activation.', 'intermediate', true, ARRAY['Front Deltoids', 'Lateral Deltoids', 'Triceps'], ARRAY['Dumbbells', 'Bench']),
('Lateral Raises', 'Shoulders', 'https://www.youtube.com/watch?v=3VcKaXpzqRo', 'Isolation exercise for lateral deltoid width.', 'beginner', false, ARRAY['Lateral Deltoids'], ARRAY['Dumbbells']),
('Front Raises', 'Shoulders', 'https://www.youtube.com/watch?v=-t7fuZ0KhDA', 'Isolation exercise for front deltoid development.', 'beginner', false, ARRAY['Front Deltoids'], ARRAY['Dumbbells']),
('Rear Delt Flyes', 'Shoulders', 'https://www.youtube.com/watch?v=EA7u4Q_8HQ0', 'Bent-over or incline fly for rear deltoid isolation.', 'beginner', false, ARRAY['Rear Deltoids'], ARRAY['Dumbbells', 'Bench']),
('Cable Lateral Raises', 'Shoulders', 'https://www.youtube.com/watch?v=PPrzBWv1OeI', 'Cable version of lateral raises with constant tension.', 'beginner', false, ARRAY['Lateral Deltoids'], ARRAY['Cable Machine']),
('Upright Row', 'Shoulders', 'https://www.youtube.com/watch?v=um3VVzqunPU', 'Pulling movement for traps and lateral deltoids.', 'intermediate', true, ARRAY['Traps', 'Lateral Deltoids'], ARRAY['Barbell']),
('Shrugs', 'Shoulders', 'https://www.youtube.com/watch?v=cJRVVxmytaM', 'Trap isolation exercise with dumbbells or barbell.', 'beginner', false, ARRAY['Traps'], ARRAY['Dumbbells']),
('Machine Shoulder Press', 'Shoulders', 'https://www.youtube.com/watch?v=Wqq43dKW1TU', 'Machine-based overhead pressing for controlled movement.', 'beginner', true, ARRAY['Front Deltoids', 'Lateral Deltoids', 'Triceps'], ARRAY['Shoulder Press Machine']),
('Reverse Pec Deck', 'Shoulders', 'https://www.youtube.com/watch?v=5YK4bgzXDp0', 'Machine exercise for rear deltoid isolation.', 'beginner', false, ARRAY['Rear Deltoids'], ARRAY['Pec Deck Machine'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- BICEPS EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Barbell Curl', 'Biceps', 'https://www.youtube.com/watch?v=kwG2ipFRgfo', 'Classic bicep exercise with barbell for mass building.', 'beginner', false, ARRAY['Biceps'], ARRAY['Barbell']),
('Dumbbell Curl', 'Biceps', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', 'Standing or seated curls with dumbbells.', 'beginner', false, ARRAY['Biceps'], ARRAY['Dumbbells']),
('Hammer Curl', 'Biceps', 'https://www.youtube.com/watch?v=zC3nLlEvin4', 'Neutral grip curls targeting brachialis and forearms.', 'beginner', false, ARRAY['Biceps', 'Brachialis', 'Forearms'], ARRAY['Dumbbells']),
('Incline Dumbbell Curl', 'Biceps', 'https://www.youtube.com/watch?v=soxrZlIl35U', 'Curls on incline bench for stretched bicep position.', 'beginner', false, ARRAY['Biceps'], ARRAY['Dumbbells', 'Incline Bench']),
('Preacher Curl', 'Biceps', 'https://www.youtube.com/watch?v=fIWP-FRFNU0', 'Curls on preacher bench for strict form and peak contraction.', 'beginner', false, ARRAY['Biceps'], ARRAY['Preacher Bench', 'Barbell']),
('Concentration Curl', 'Biceps', 'https://www.youtube.com/watch?v=0AUGkch3tzc', 'Seated single-arm curl for bicep peak focus.', 'beginner', false, ARRAY['Biceps'], ARRAY['Dumbbell']),
('Cable Curl', 'Biceps', 'https://www.youtube.com/watch?v=NFzTWp2qpiE', 'Cable curls with constant tension throughout movement.', 'beginner', false, ARRAY['Biceps'], ARRAY['Cable Machine']),
('EZ Bar Curl', 'Biceps', 'https://www.youtube.com/watch?v=zG2xJ0Q5QtI', 'Curls with EZ bar for reduced wrist strain.', 'beginner', false, ARRAY['Biceps'], ARRAY['EZ Bar']),
('Spider Curl', 'Biceps', 'https://www.youtube.com/watch?v=FVEHmQ7xiAs', 'Curls on incline bench face down for peak contraction.', 'intermediate', false, ARRAY['Biceps'], ARRAY['Dumbbells', 'Incline Bench']),
('Reverse Curl', 'Biceps', 'https://www.youtube.com/watch?v=nRgxYX2Ve9w', 'Overhand grip curls for brachioradialis and forearms.', 'beginner', false, ARRAY['Forearms', 'Brachialis'], ARRAY['Barbell'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- TRICEPS EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Close Grip Bench Press', 'Triceps', 'https://www.youtube.com/watch?v=nEF0bv2FW94', 'Narrow grip bench press emphasizing triceps.', 'intermediate', true, ARRAY['Triceps', 'Chest'], ARRAY['Barbell', 'Bench']),
('Tricep Dips', 'Triceps', 'https://www.youtube.com/watch?v=0326dy_-CzM', 'Bodyweight dips with upright torso for tricep focus.', 'intermediate', true, ARRAY['Triceps', 'Chest', 'Front Deltoids'], ARRAY['Dip Bars']),
('Skull Crushers', 'Triceps', 'https://www.youtube.com/watch?v=d_KZxkY_0cM', 'Lying tricep extension with EZ bar or dumbbells.', 'intermediate', false, ARRAY['Triceps'], ARRAY['EZ Bar', 'Bench']),
('Tricep Pushdown', 'Triceps', 'https://www.youtube.com/watch?v=2-LAMcpzODU', 'Cable pushdown for tricep isolation.', 'beginner', false, ARRAY['Triceps'], ARRAY['Cable Machine']),
('Overhead Tricep Extension', 'Triceps', 'https://www.youtube.com/watch?v=_gsUck-7M74', 'Overhead extension with dumbbell or cable for long head.', 'beginner', false, ARRAY['Triceps'], ARRAY['Dumbbell']),
('Rope Pushdown', 'Triceps', 'https://www.youtube.com/watch?v=vB5OHsJ3EME', 'Cable pushdown with rope attachment for lateral head focus.', 'beginner', false, ARRAY['Triceps'], ARRAY['Cable Machine', 'Rope Attachment']),
('Diamond Push-Ups', 'Triceps', 'https://www.youtube.com/watch?v=J0DnG1_S92I', 'Close hand position push-ups for tricep emphasis.', 'intermediate', true, ARRAY['Triceps', 'Chest'], ARRAY['None']),
('Bench Dips', 'Triceps', 'https://www.youtube.com/watch?v=0326dy_-CzM', 'Bodyweight dips using a bench for support.', 'beginner', true, ARRAY['Triceps'], ARRAY['Bench']),
('Cable Overhead Extension', 'Triceps', 'https://www.youtube.com/watch?v=kiuVA0gs3EI', 'Cable extension overhead for long head stretch.', 'beginner', false, ARRAY['Triceps'], ARRAY['Cable Machine']),
('Kickbacks', 'Triceps', 'https://www.youtube.com/watch?v=ZO81bExngMI', 'Bent-over dumbbell tricep extension.', 'beginner', false, ARRAY['Triceps'], ARRAY['Dumbbell'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- LEGS EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Barbell Squat', 'Legs', 'https://www.youtube.com/watch?v=bEv6CCg2BC8', 'King of leg exercises for overall lower body development.', 'intermediate', true, ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], ARRAY['Barbell', 'Squat Rack']),
('Front Squat', 'Legs', 'https://www.youtube.com/watch?v=m4ytaCJZpl0', 'Barbell squat with front rack position emphasizing quads.', 'advanced', true, ARRAY['Quadriceps', 'Core', 'Glutes'], ARRAY['Barbell', 'Squat Rack']),
('Leg Press', 'Legs', 'https://www.youtube.com/watch?v=IZxyjW7MPJQ', 'Machine pressing for quad and glute development.', 'beginner', true, ARRAY['Quadriceps', 'Glutes'], ARRAY['Leg Press Machine']),
('Goblet Squat', 'Legs', 'https://www.youtube.com/watch?v=MeIiIdhvXT4', 'Dumbbell squat variation great for beginners.', 'beginner', true, ARRAY['Quadriceps', 'Glutes'], ARRAY['Dumbbell']),
('Bulgarian Split Squat', 'Legs', 'https://www.youtube.com/watch?v=2C-uNgKwPLE', 'Single-leg squat with rear foot elevated.', 'intermediate', true, ARRAY['Quadriceps', 'Glutes'], ARRAY['Dumbbells', 'Bench']),
('Lunges', 'Legs', 'https://www.youtube.com/watch?v=QOVaHwm-Q6U', 'Walking or stationary lunges for leg development.', 'beginner', true, ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], ARRAY['Dumbbells']),
('Leg Extension', 'Legs', 'https://www.youtube.com/watch?v=YyvSfVjQeL0', 'Machine isolation for quadriceps.', 'beginner', false, ARRAY['Quadriceps'], ARRAY['Leg Extension Machine']),
('Leg Curl', 'Legs', 'https://www.youtube.com/watch?v=1Tq3QdYUuHs', 'Machine isolation for hamstrings.', 'beginner', false, ARRAY['Hamstrings'], ARRAY['Leg Curl Machine']),
('Hack Squat', 'Legs', 'https://www.youtube.com/watch?v=0tn5K9NlCfo', 'Machine squat variation for quad emphasis.', 'intermediate', true, ARRAY['Quadriceps', 'Glutes'], ARRAY['Hack Squat Machine']),
('Step-Ups', 'Legs', 'https://www.youtube.com/watch?v=dQqApCGd5Ss', 'Single-leg stepping exercise for functional strength.', 'beginner', true, ARRAY['Quadriceps', 'Glutes'], ARRAY['Box', 'Dumbbells']),
('Sissy Squat', 'Legs', 'https://www.youtube.com/watch?v=7fxyYHPLtB4', 'Quad isolation movement with backward lean.', 'advanced', false, ARRAY['Quadriceps'], ARRAY['None']),
('Wall Sit', 'Legs', 'https://www.youtube.com/watch?v=y-wV4Venusw', 'Isometric hold against wall for quad endurance.', 'beginner', false, ARRAY['Quadriceps'], ARRAY['None']),
('Stiff Leg Deadlift', 'Legs', 'https://www.youtube.com/watch?v=1uDiW5--rAE', 'Hip hinge movement with minimal knee bend for hamstrings.', 'intermediate', true, ARRAY['Hamstrings', 'Glutes', 'Lower Back'], ARRAY['Barbell']),
('Good Mornings', 'Legs', 'https://www.youtube.com/watch?v=YA-h3n9L4YU', 'Hip hinge with barbell on back for posterior chain.', 'intermediate', true, ARRAY['Hamstrings', 'Lower Back', 'Glutes'], ARRAY['Barbell'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- GLUTES EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Hip Thrust', 'Glutes', 'https://www.youtube.com/watch?v=SEdqd1n0cvg', 'Primary glute builder with barbell across hips.', 'beginner', true, ARRAY['Glutes', 'Hamstrings'], ARRAY['Barbell', 'Bench']),
('Glute Bridge', 'Glutes', 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E', 'Floor-based hip extension for glute activation.', 'beginner', false, ARRAY['Glutes'], ARRAY['None']),
('Cable Kickback', 'Glutes', 'https://www.youtube.com/watch?v=RfEBi9FBQJM', 'Cable exercise for isolated glute contraction.', 'beginner', false, ARRAY['Glutes'], ARRAY['Cable Machine', 'Ankle Strap']),
('Sumo Deadlift', 'Glutes', 'https://www.youtube.com/watch?v=dfLu7kxsrMk', 'Wide stance deadlift variation emphasizing glutes.', 'intermediate', true, ARRAY['Glutes', 'Inner Thighs', 'Hamstrings'], ARRAY['Barbell']),
('Romanian Deadlift', 'Glutes', 'https://www.youtube.com/watch?v=7j-2w4-P14I', 'Hip hinge for glutes and hamstrings.', 'intermediate', true, ARRAY['Glutes', 'Hamstrings', 'Lower Back'], ARRAY['Barbell']),
('Single Leg Romanian Deadlift', 'Glutes', 'https://www.youtube.com/watch?v=_Po1hbmJlAE', 'Unilateral hip hinge for glute and balance work.', 'intermediate', true, ARRAY['Glutes', 'Hamstrings'], ARRAY['Dumbbell']),
('Curtsy Lunge', 'Glutes', 'https://www.youtube.com/watch?v=2Laz6xOc7RE', 'Crossover lunge variation targeting glute medius.', 'intermediate', true, ARRAY['Glutes', 'Quadriceps'], ARRAY['Dumbbells']),
('Cable Pull Through', 'Glutes', 'https://www.youtube.com/watch?v=ArPd2VqAJ0c', 'Cable hip hinge for glute and hamstring activation.', 'beginner', true, ARRAY['Glutes', 'Hamstrings'], ARRAY['Cable Machine']),
('Frog Pumps', 'Glutes', 'https://www.youtube.com/watch?v=Uo5LKq2ylGI', 'Floor glute exercise with feet together.', 'beginner', false, ARRAY['Glutes'], ARRAY['None']),
('Fire Hydrants', 'Glutes', 'https://www.youtube.com/watch?v=CMi_Qw6NJqs', 'Quadruped hip abduction for glute medius.', 'beginner', false, ARRAY['Glutes'], ARRAY['None']),
('Donkey Kicks', 'Glutes', 'https://www.youtube.com/watch?v=pXxR_yewINQ', 'Quadruped hip extension for glute max.', 'beginner', false, ARRAY['Glutes'], ARRAY['None']),
('Clamshells', 'Glutes', 'https://www.youtube.com/watch?v=lj7mcpPfEPg', 'Side-lying hip rotation for glute medius activation.', 'beginner', false, ARRAY['Glutes'], ARRAY['Resistance Band'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- CORE EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Plank', 'Core', 'https://www.youtube.com/watch?v=ASdvN_XEl_c', 'Isometric core hold for stability and endurance.', 'beginner', false, ARRAY['Core', 'Shoulders'], ARRAY['None']),
('Crunches', 'Core', 'https://www.youtube.com/watch?v=Xyd_fa5zoEU', 'Basic ab exercise for upper rectus abdominis.', 'beginner', false, ARRAY['Abs'], ARRAY['None']),
('Leg Raises', 'Core', 'https://www.youtube.com/watch?v=JB2oyawG9KI', 'Hanging or lying leg raises for lower abs.', 'intermediate', false, ARRAY['Lower Abs', 'Hip Flexors'], ARRAY['Pull-Up Bar']),
('Russian Twist', 'Core', 'https://www.youtube.com/watch?v=wkD8rjkodUI', 'Rotational core exercise for obliques.', 'beginner', false, ARRAY['Obliques', 'Core'], ARRAY['None']),
('Dead Bug', 'Core', 'https://www.youtube.com/watch?v=I5xbsA71v1A', 'Anti-extension core exercise for stability.', 'beginner', false, ARRAY['Core', 'Hip Flexors'], ARRAY['None']),
('Bird Dog', 'Core', 'https://www.youtube.com/watch?v=wiFNA3sqjCA', 'Quadruped stability exercise for core and back.', 'beginner', false, ARRAY['Core', 'Lower Back'], ARRAY['None']),
('Mountain Climbers', 'Core', 'https://www.youtube.com/watch?v=nmwgirgXLYM', 'Dynamic plank with alternating knee drives.', 'beginner', true, ARRAY['Core', 'Hip Flexors', 'Shoulders'], ARRAY['None']),
('Bicycle Crunches', 'Core', 'https://www.youtube.com/watch?v=9FGilxCbdz8', 'Rotational crunch for obliques and rectus abdominis.', 'beginner', false, ARRAY['Abs', 'Obliques'], ARRAY['None']),
('Cable Woodchop', 'Core', 'https://www.youtube.com/watch?v=pAplQXk3dkU', 'Rotational cable exercise for obliques and power.', 'intermediate', true, ARRAY['Obliques', 'Core'], ARRAY['Cable Machine']),
('Ab Rollout', 'Core', 'https://www.youtube.com/watch?v=AO_XqXWVxRs', 'Anti-extension exercise with ab wheel.', 'advanced', false, ARRAY['Core', 'Lats'], ARRAY['Ab Wheel']),
('Hanging Knee Raise', 'Core', 'https://www.youtube.com/watch?v=Pr1ieGZ5atk', 'Hanging ab exercise for lower abs.', 'intermediate', false, ARRAY['Lower Abs', 'Hip Flexors'], ARRAY['Pull-Up Bar']),
('Pallof Press', 'Core', 'https://www.youtube.com/watch?v=AH_QZLm_0-s', 'Anti-rotation cable exercise for core stability.', 'beginner', false, ARRAY['Core', 'Obliques'], ARRAY['Cable Machine']),
('Side Plank', 'Core', 'https://www.youtube.com/watch?v=K2VljzCC16g', 'Lateral isometric hold for obliques.', 'beginner', false, ARRAY['Obliques', 'Core'], ARRAY['None']),
('Hollow Body Hold', 'Core', 'https://www.youtube.com/watch?v=LlDNef_Ztsc', 'Gymnastics-style core hold for total ab tension.', 'intermediate', false, ARRAY['Core', 'Hip Flexors'], ARRAY['None']),
('Toe Touches', 'Core', 'https://www.youtube.com/watch?v=9zEBiNS1rMo', 'Lying ab exercise reaching for toes.', 'beginner', false, ARRAY['Abs'], ARRAY['None'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- FULL BODY / COMPOUND EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Burpees', 'Full Body', 'https://www.youtube.com/watch?v=dZgVxmf6jkA', 'Full body plyometric exercise for conditioning.', 'intermediate', true, ARRAY['Full Body'], ARRAY['None']),
('Clean and Press', 'Full Body', 'https://www.youtube.com/watch?v=4_aqJ_QrDVA', 'Olympic-style lift combining clean and overhead press.', 'advanced', true, ARRAY['Full Body'], ARRAY['Barbell']),
('Thrusters', 'Full Body', 'https://www.youtube.com/watch?v=L219ltL15zk', 'Front squat to overhead press combination.', 'intermediate', true, ARRAY['Legs', 'Shoulders', 'Core'], ARRAY['Barbell']),
('Turkish Get-Up', 'Full Body', 'https://www.youtube.com/watch?v=B0OzZ6mNXRA', 'Complex movement from lying to standing with weight overhead.', 'advanced', true, ARRAY['Full Body'], ARRAY['Kettlebell']),
('Kettlebell Swing', 'Full Body', 'https://www.youtube.com/watch?v=YSxHifyI6s8', 'Hip-hinge explosive movement for posterior chain.', 'intermediate', true, ARRAY['Glutes', 'Hamstrings', 'Core'], ARRAY['Kettlebell']),
('Man Makers', 'Full Body', 'https://www.youtube.com/watch?v=b5WFdMYyFE8', 'Burpee variation with dumbbell rows and press.', 'advanced', true, ARRAY['Full Body'], ARRAY['Dumbbells']),
('Bear Crawl', 'Full Body', 'https://www.youtube.com/watch?v=BXvb-Vt9S14', 'Quadruped crawling pattern for core and coordination.', 'beginner', true, ARRAY['Core', 'Shoulders', 'Quadriceps'], ARRAY['None']),
('Box Jumps', 'Full Body', 'https://www.youtube.com/watch?v=52r_Ul5k03g', 'Plyometric jumping exercise for power.', 'intermediate', true, ARRAY['Legs', 'Glutes'], ARRAY['Plyo Box']),
('Jumping Jacks', 'Full Body', 'https://www.youtube.com/watch?v=c4DAnQ6DtF8', 'Classic full body cardio movement.', 'beginner', true, ARRAY['Full Body'], ARRAY['None']),
('High Knees', 'Full Body', 'https://www.youtube.com/watch?v=oDdkytliOqE', 'Running in place with high knee drive.', 'beginner', true, ARRAY['Core', 'Hip Flexors'], ARRAY['None'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- CARDIO EXERCISES
INSERT INTO exercises (name, muscle_group, youtube_url, description, difficulty_level, is_compound, primary_muscles, equipment_required) VALUES
('Treadmill Running', 'Cardio', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', 'Indoor running for cardiovascular fitness.', 'beginner', true, ARRAY['Cardiovascular', 'Legs'], ARRAY['Treadmill']),
('Rowing Machine', 'Cardio', 'https://www.youtube.com/watch?v=mZLSbbAfuFo', 'Full body cardio machine with pulling motion.', 'beginner', true, ARRAY['Cardiovascular', 'Back', 'Legs'], ARRAY['Rowing Machine']),
('Stair Climber', 'Cardio', 'https://www.youtube.com/watch?v=y_kJZPGz5sw', 'Step climbing machine for cardio and leg endurance.', 'beginner', true, ARRAY['Cardiovascular', 'Legs', 'Glutes'], ARRAY['Stair Climber']),
('Battle Ropes', 'Cardio', 'https://www.youtube.com/watch?v=ts7TX82V31E', 'High intensity rope training for conditioning.', 'intermediate', true, ARRAY['Shoulders', 'Core', 'Cardiovascular'], ARRAY['Battle Ropes']),
('Jump Rope', 'Cardio', 'https://www.youtube.com/watch?v=u3zgHI8QnqE', 'Classic cardio exercise with jump rope.', 'beginner', true, ARRAY['Cardiovascular', 'Calves'], ARRAY['Jump Rope']),
('Assault Bike', 'Cardio', 'https://www.youtube.com/watch?v=8TnlMRuCLp4', 'Air resistance bike for intense cardio.', 'intermediate', true, ARRAY['Cardiovascular', 'Legs', 'Arms'], ARRAY['Assault Bike']),
('Sprints', 'Cardio', 'https://www.youtube.com/watch?v=6pXQkUcdo3A', 'High intensity running intervals.', 'intermediate', true, ARRAY['Cardiovascular', 'Legs', 'Glutes'], ARRAY['None']),
('Sled Push', 'Cardio', 'https://www.youtube.com/watch?v=lhjBTG6VlKU', 'Pushing weighted sled for conditioning.', 'intermediate', true, ARRAY['Legs', 'Core', 'Cardiovascular'], ARRAY['Sled'])
ON CONFLICT (name) DO UPDATE SET youtube_url = EXCLUDED.youtube_url, description = EXCLUDED.description, difficulty_level = EXCLUDED.difficulty_level, is_compound = EXCLUDED.is_compound, primary_muscles = EXCLUDED.primary_muscles, equipment_required = EXCLUDED.equipment_required;

-- Update existing exercises that may have been created without videos
-- This will add videos to any exercises that match by name (case insensitive)
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=rT7DgCr-3pg' WHERE LOWER(name) LIKE '%bench press%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=bEv6CCg2BC8' WHERE LOWER(name) LIKE '%squat%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=op9kVnSso6Q' WHERE LOWER(name) LIKE '%deadlift%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=eGo4IYlbE5g' WHERE LOWER(name) LIKE '%pull%up%' OR LOWER(name) LIKE '%pullup%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=2yjwXTZQDDI' WHERE LOWER(name) LIKE '%overhead press%' OR LOWER(name) LIKE '%shoulder press%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=pYcpY20QaE8' WHERE LOWER(name) LIKE '%row%' AND LOWER(name) NOT LIKE '%upright%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=kwG2ipFRgfo' WHERE LOWER(name) LIKE '%curl%' AND LOWER(name) NOT LIKE '%leg curl%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=2-LAMcpzODU' WHERE LOWER(name) LIKE '%pushdown%' OR LOWER(name) LIKE '%tricep extension%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=QOVaHwm-Q6U' WHERE LOWER(name) LIKE '%lunge%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=SEdqd1n0cvg' WHERE LOWER(name) LIKE '%hip thrust%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=ASdvN_XEl_c' WHERE LOWER(name) LIKE '%plank%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=Xyd_fa5zoEU' WHERE LOWER(name) LIKE '%crunch%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=3VcKaXpzqRo' WHERE LOWER(name) LIKE '%lateral raise%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=CAwf7n6Luuc' WHERE LOWER(name) LIKE '%lat pulldown%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=taI4XduLpTk' WHERE LOWER(name) LIKE '%cable fly%' OR LOWER(name) LIKE '%cable crossover%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=rep-qVOkqgk' WHERE LOWER(name) LIKE '%face pull%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=IODxDxX7oi4' WHERE LOWER(name) LIKE '%push%up%' OR LOWER(name) LIKE '%pushup%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=dX_nSOOJIsE' WHERE LOWER(name) LIKE '%dip%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=YyvSfVjQeL0' WHERE LOWER(name) LIKE '%leg extension%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=1Tq3QdYUuHs' WHERE LOWER(name) LIKE '%leg curl%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=cJRVVxmytaM' WHERE LOWER(name) LIKE '%shrug%' AND youtube_url IS NULL;
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=YSxHifyI6s8' WHERE LOWER(name) LIKE '%kettlebell swing%' AND youtube_url IS NULL;

-- Show summary of exercises with videos
SELECT
  muscle_group,
  COUNT(*) as total,
  COUNT(youtube_url) as with_video,
  ROUND(COUNT(youtube_url)::numeric / COUNT(*)::numeric * 100, 1) as video_coverage_pct
FROM exercises
GROUP BY muscle_group
ORDER BY muscle_group;
