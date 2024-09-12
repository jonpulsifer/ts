import { describe, expect, it } from '@jest/globals';
import { part1 } from './day06';
import { readInput } from './lib';

describe('tests day 6 sample', () => {
  const input = `
3,4,3,1,2
`;
  it('grows lanternfish', () => {
    expect(part1(input, 18)).toBe(26);
    expect(part1(input, 80)).toBe(5934);
    expect(part1(input, 256)).toBe(26984457539);
  });
});

describe('solves day 6', () => {
  const input = readInput(6);
  it('grows lanternfish', () => {
    expect(part1(input, 80)).toBe(393019);
    expect(part1(input, 256)).toBe(1757714216975);
  });
});
