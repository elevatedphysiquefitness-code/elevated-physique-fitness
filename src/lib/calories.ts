// MET values for common activities by intensity
// Source: Compendium of Physical Activities (Ainsworth et al.)

export const ACTIVITY_MET_VALUES: Record<string, Record<string, number>> = {
  workout:  { low: 3.5, moderate: 5.0, high: 6.0, very_high: 8.0 },
  cardio:   { low: 4.0, moderate: 6.0, high: 8.0, very_high: 10.0 },
  walking:  { low: 2.5, moderate: 3.5, high: 4.5, very_high: 5.0 },
  running:  { low: 6.0, moderate: 8.3, high: 10.0, very_high: 12.5 },
  swimming: { low: 4.5, moderate: 6.0, high: 8.0, very_high: 10.0 },
  hiit:     { low: 6.0, moderate: 8.0, high: 10.0, very_high: 12.0 },
  cycling:  { low: 4.0, moderate: 6.8, high: 8.0, very_high: 10.0 },
  yoga:     { low: 2.0, moderate: 3.0, high: 4.0, very_high: 5.0 },
  other:    { low: 3.0, moderate: 5.0, high: 7.0, very_high: 9.0 },
};

export const ACTIVITY_LABELS: Record<string, string> = {
  workout: 'Weight Training',
  cardio: 'Cardio (General)',
  walking: 'Walking',
  running: 'Running',
  swimming: 'Swimming',
  hiit: 'HIIT',
  cycling: 'Cycling',
  yoga: 'Yoga / Stretching',
  other: 'Other Activity',
  manual_entry: 'Manual Entry',
};

export const INTENSITY_LABELS: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
};

/**
 * Estimate calories burned using MET formula.
 * Calories = MET × weight(kg) × duration(hours)
 */
export function estimateCaloriesBurned(
  activityType: string,
  intensity: string,
  durationMinutes: number,
  weightLbs: number
): number {
  const met = ACTIVITY_MET_VALUES[activityType]?.[intensity]
    ?? ACTIVITY_MET_VALUES['other']?.[intensity]
    ?? 5.0;
  const weightKg = weightLbs * 0.453592;
  const durationHours = durationMinutes / 60;
  return Math.round(met * weightKg * durationHours);
}

/**
 * Estimate calories burned for a completed workout based on RPE.
 * Maps average RPE (1-10) to intensity level.
 */
export function estimateWorkoutCalories(
  durationMinutes: number,
  averageRpe: number | null,
  weightLbs: number
): number {
  let intensity: string;
  if (!averageRpe || averageRpe < 5) intensity = 'low';
  else if (averageRpe < 7) intensity = 'moderate';
  else if (averageRpe < 9) intensity = 'high';
  else intensity = 'very_high';

  return estimateCaloriesBurned('workout', intensity, durationMinutes, weightLbs);
}
