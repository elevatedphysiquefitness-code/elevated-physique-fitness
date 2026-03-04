/**
 * Calculate the next billing date based on billing interval and optional custom billing days.
 *
 * For 'semimonthly' interval with billing_day_1 and billing_day_2 set (e.g., 11 and 25),
 * returns the next upcoming billing day from today.
 *
 * For other intervals (weekly, biweekly, monthly), calculates from the given reference date.
 */
export function getNextBillingDate(
  billingInterval: string,
  referenceDate?: Date,
  billingDay1?: number | null,
  billingDay2?: number | null
): string {
  if (billingInterval === 'semimonthly' && billingDay1 && billingDay2) {
    return getNextSemiMonthlyDate(billingDay1, billingDay2, referenceDate);
  }

  const date = referenceDate ? new Date(referenceDate) : new Date();
  if (billingInterval === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (billingInterval === 'biweekly') {
    date.setDate(date.getDate() + 14);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString().split('T')[0];
}

/**
 * Given two billing days (e.g., 11 and 25), find the next one from today (or referenceDate).
 */
function getNextSemiMonthlyDate(
  day1: number,
  day2: number,
  referenceDate?: Date
): string {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  now.setHours(0, 0, 0, 0);

  const [small, big] = day1 < day2 ? [day1, day2] : [day2, day1];
  const currentDay = now.getDate();
  let year = now.getFullYear();
  let month = now.getMonth();

  let targetDay: number;

  if (currentDay < small) {
    targetDay = small;
  } else if (currentDay < big) {
    targetDay = big;
  } else {
    // Move to next month, use the smaller day
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    targetDay = small;
  }

  // Clamp to last day of target month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const clampedDay = Math.min(targetDay, daysInMonth);

  const result = new Date(year, month, clampedDay);
  return result.toISOString().split('T')[0];
}
