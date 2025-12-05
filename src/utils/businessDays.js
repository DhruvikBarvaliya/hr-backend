// src/utils/businessDays.js
const Holiday = require('../models/Holiday');

/**
 * Business-day utilities
 *
 * - Works with date-only strings or Date objects.
 * - Compares dates by YYYY-MM-DD (UTC) to avoid timezone shifts.
 * - Configurable weekend days via env WEEKEND_DAYS (comma-separated list of numbers 0..6, where 0=Sunday).
 *
 * Exports:
 *  - dateToYMD(date) -> 'YYYY-MM-DD'
 *  - isWeekendDate(date) -> boolean
 *  - isHolidayDate(date) -> Promise<boolean>
 *  - isBusinessDay(date) -> Promise<boolean>
 *  - countBusinessDays(start, end) -> Promise<number>
 *  - listBusinessDays(start, end) -> Promise<string[]> (array of 'YYYY-MM-DD')
 */

const DEFAULT_WEEKEND = [0, 6]; // Sunday (0) and Saturday (6)

function parseWeekendEnv() {
  const raw = process.env.WEEKEND_DAYS;
  if (!raw) return DEFAULT_WEEKEND;
  try {
    return raw.split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  } catch (e) {
    return DEFAULT_WEEKEND;
  }
}
const WEEKEND_DAYS = parseWeekendEnv();

/** Convert a Date or ISO string to 'YYYY-MM-DD' in UTC */
function dateToYMD(input) {
  const d = (input instanceof Date) ? new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate())) : new Date(input);
  // normalize to UTC midnight
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Return a Date object (UTC midnight) for a YMD string */
function ymdToDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Check weekend by UTC day number (0..6) */
function isWeekendDate(input) {
  const d = new Date(input instanceof Date ? input : new Date(input));
  const day = d.getUTCDay(); // 0..6 (Sun..Sat)
  return WEEKEND_DAYS.includes(day);
}

/** Check if a given date (Date or ISO) is a holiday (in DB) */
async function isHolidayDate(input) {
  const ymd = dateToYMD(input);
  // search by date bounds for that day in UTC
  const start = ymdToDate(ymd);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const found = await Holiday.findOne({ date: { $gte: start, $lt: end } }).lean();
  return !!found;
}

/** Check if it's a business day (not weekend and not holiday) */
async function isBusinessDay(input) {
  if (isWeekendDate(input)) return false;
  if (await isHolidayDate(input)) return false;
  return true;
}

/**
 * Count business days between start and end (inclusive).
 * Both start and end can be Date or ISO date string.
 * This queries holidays in a single DB call for the date range (efficient).
 */
async function countBusinessDays(startInput, endInput) {
  const startYmd = dateToYMD(startInput);
  const endYmd = dateToYMD(endInput);
  const start = ymdToDate(startYmd);
  const end = ymdToDate(endYmd);
  if (end < start) return 0;

  // Build date strings list length => (end - start) days
  const days = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(dateToYMD(d));
  }

  // Query holidays that fall in this range (using UTC date bounds)
  const holidays = await Holiday.find({
    date: {
      $gte: start,
      $lte: new Date(end.getTime() + (24 * 60 * 60 * 1000) - 1),
    },
  }).lean();

  const holidaySet = new Set(holidays.map((h) => dateToYMD(h.date)));

  // Count business days
  let count = 0;
  for (let i = 0; i < days.length; i += 1) {
    const dayYmd = days[i];
    const dayDate = ymdToDate(dayYmd);
    const weekday = dayDate.getUTCDay();
    if (WEEKEND_DAYS.includes(weekday)) continue;
    if (holidaySet.has(dayYmd)) continue;
    count += 1;
  }
  return count;
}

/**
 * Return list of business days between start and end (inclusive) as 'YYYY-MM-DD' strings.
 */
async function listBusinessDays(startInput, endInput) {
  const startYmd = dateToYMD(startInput);
  const endYmd = dateToYMD(endInput);
  const start = ymdToDate(startYmd);
  const end = ymdToDate(endYmd);
  if (end < start) return [];

  const days = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(dateToYMD(d));
  }

  const holidays = await Holiday.find({
    date: {
      $gte: start,
      $lte: new Date(end.getTime() + (24 * 60 * 60 * 1000) - 1),
    },
  }).lean();
  const holidaySet = new Set(holidays.map((h) => dateToYMD(h.date)));

  const out = [];
  for (let i = 0; i < days.length; i += 1) {
    const ymd = days[i];
    const dObj = ymdToDate(ymd);
    if (WEEKEND_DAYS.includes(dObj.getUTCDay())) continue;
    if (holidaySet.has(ymd)) continue;
    out.push(ymd);
  }
  return out;
}

module.exports = {
  dateToYMD,
  isWeekendDate,
  isHolidayDate,
  isBusinessDay,
  countBusinessDays,
  listBusinessDays,
};
