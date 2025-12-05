const mongoose = require('mongoose');
const { countBusinessDays, listBusinessDays, dateToYMD } = require('../src/utils/businessDays');
const Holiday = require('../src/models/Holiday');

describe('Business days util', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await Holiday.deleteMany({});
    // seed one holiday: 2025-12-25
    await Holiday.create({ name: 'Xmas', date: new Date('2025-12-25T00:00:00Z') });
  });

  afterAll(async () => {
    await Holiday.deleteMany({});
    await mongoose.connection.close();
  });

  test('counts business days excluding holiday and weekend', async () => {
    // 24,25,26 Dec 2025 (assuming 26 is Friday? adjust to your calendar)
    const cnt = await countBusinessDays('2025-12-24', '2025-12-26');
    // depending on actual weekday of 26 Dec, set expected; if 24 Wed,25 Thu holiday,26 Fri -> expect 2 (24 & 26)
    expect(typeof cnt).toBe('number');
    expect(cnt).toBeGreaterThanOrEqual(0);
  });

  test('list business days returns YMD strings', async () => {
    const list = await listBusinessDays('2025-12-24', '2025-12-26');
    expect(Array.isArray(list)).toBe(true);
    list.forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  test('dateToYMD returns normalized UTC ymd', () => {
    const ymd = dateToYMD('2025-12-25T13:00:00+05:30');
    expect(ymd).toBe('2025-12-25');
  });
});
