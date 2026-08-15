export const EVENT_MONTH = 12; // December
export const EVENT_DAY = 16;
export const EVENT_HOUR = 20;
export const EVENT_MINUTE = 0;

/**
 * Next party occurrence strictly after `now`, computed in device-local time.
 * Returns this year's event if it hasn't started yet, otherwise next year's.
 */
export const getNextBirthday = (now: Date = new Date()): Date => {
  const thisYear = new Date(
    now.getFullYear(),
    EVENT_MONTH - 1,
    EVENT_DAY,
    EVENT_HOUR,
    EVENT_MINUTE,
    0,
    0
  );
  return thisYear > now
    ? thisYear
    : new Date(
        now.getFullYear() + 1,
        EVENT_MONTH - 1,
        EVENT_DAY,
        EVENT_HOUR,
        EVENT_MINUTE,
        0,
        0
      );
};
