import { describe, expect, it } from 'vitest';
import {
  ASK_AFTER_DAYS,
  ASK_AFTER_USES,
  SNOOZE_DAYS,
  answered,
  recordUse,
  shouldAsk,
  snooze,
  type RatingState,
} from '../src/lib/rating.js';

const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 9, 1);
const FRESH: RatingState = { firstUseAt: null, uses: 0, snoozes: 0, snoozedUntil: null, done: false };

function used(times: number, at = START): RatingState {
  let state = FRESH;
  for (let i = 0; i < times; i++) state = recordUse(state, at);
  return state;
}

describe('when to ask for a rating', () => {
  it('never asks someone who has not used a code', () => {
    expect(shouldAsk(FRESH, START + 365 * DAY)).toBe(false);
  });

  it('needs both a week and real use — many codes on day one is not enough, nor a week of one', () => {
    expect(shouldAsk(used(ASK_AFTER_USES * 10), START + (ASK_AFTER_DAYS - 1) * DAY)).toBe(false);
    expect(shouldAsk(used(ASK_AFTER_USES - 1), START + 365 * DAY)).toBe(false);
    expect(shouldAsk(used(ASK_AFTER_USES), START + ASK_AFTER_DAYS * DAY)).toBe(true);
  });

  it('counts the week from the first use, not the latest', () => {
    const state = recordUse(used(ASK_AFTER_USES - 1), START + 5 * DAY);
    expect(state.firstUseAt).toBe(START);
    expect(shouldAsk(state, START + ASK_AFTER_DAYS * DAY)).toBe(true);
  });

  it('"Not now" waits two months, and the second one is final', () => {
    const due = START + ASK_AFTER_DAYS * DAY;
    const once = snooze(used(ASK_AFTER_USES), due);
    expect(shouldAsk(once, due + (SNOOZE_DAYS - 1) * DAY)).toBe(false);
    expect(shouldAsk(once, due + SNOOZE_DAYS * DAY)).toBe(true);

    const twice = snooze(once, due + SNOOZE_DAYS * DAY);
    expect(shouldAsk(twice, due + 10 * 365 * DAY)).toBe(false);
  });

  it('never asks again once rated, and stops counting', () => {
    const rated = answered(used(ASK_AFTER_USES));
    expect(shouldAsk(rated, START + 365 * DAY)).toBe(false);
    expect(recordUse(rated, START)).toBe(rated);
  });
});
