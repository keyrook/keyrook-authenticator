import { describe, expect, it } from 'vitest';
import { createSerialiser } from '../src/serial.js';

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe('serialising vault writes', () => {
  it('never lets two pieces of work overlap', async () => {
    const serial = createSerialiser();
    const events: string[] = [];

    const job = (name: string, ms: number) =>
      serial(async () => {
        events.push(`${name} start`);
        await tick(ms);
        events.push(`${name} end`);
      });

    // Started together, longest first, so an unsynchronised version would
    // obviously interleave.
    await Promise.all([job('a', 30), job('b', 10), job('c', 0)]);

    expect(events).toEqual([
      'a start', 'a end',
      'b start', 'b end',
      'c start', 'c end',
    ]);
  });

  it('models the lost update it exists to prevent', async () => {
    // This is the bug, with and without the queue: read, change, write back.
    // The read has to happen inside the turn, which is why the whole
    // read-modify-write goes through the serialiser rather than just the write.
    const readModifyWrite = async (store: { value: string[] }, entry: string) => {
      const snapshot = store.value;
      await tick(5);
      store.value = [...snapshot, entry];
    };

    const racy = { value: [] as string[] };
    await Promise.all([readModifyWrite(racy, 'a'), readModifyWrite(racy, 'b')]);
    expect(racy.value).toHaveLength(1);

    const serial = createSerialiser();
    const safe = { value: [] as string[] };
    await Promise.all([
      serial(() => readModifyWrite(safe, 'a')),
      serial(() => readModifyWrite(safe, 'b')),
    ]);
    expect(safe.value.sort()).toEqual(['a', 'b']);
  });

  it('keeps going after one piece of work throws', async () => {
    const serial = createSerialiser();
    const done: string[] = [];

    const failed = serial(async () => {
      throw new Error('storage full');
    });
    const after = serial(async () => {
      done.push('after');
      return 'ok';
    });

    await expect(failed).rejects.toThrow('storage full');
    // A failed write must not wedge the queue — the next one is somebody's
    // account being saved.
    expect(await after).toBe('ok');
    expect(done).toEqual(['after']);
  });

  it('hands each caller its own result', async () => {
    const serial = createSerialiser();
    const results = await Promise.all([
      serial(async () => 1),
      serial(async () => 2),
      serial(async () => 3),
    ]);
    expect(results).toEqual([1, 2, 3]);
  });
});
