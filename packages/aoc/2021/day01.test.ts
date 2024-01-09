import { part1, part2 } from './day01';
import { readInput } from './lib';

describe('tests day 1', () => {
  const sample = `
199
200
208
210
200
207
240
269
260
263
`;

  it('should count the things', () => {
    expect(part1(sample)).toBe(7);
    expect(part2(sample)).toBe(5);
  });
});

describe('solves day 1', () => {
  const sample = readInput(1);
  it('should count the things', () => {
    expect(part1(sample)).toBe(1722);
    expect(part2(sample)).toBe(1748);
  });
});
