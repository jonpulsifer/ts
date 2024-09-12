import { describe, expect, it } from '@jest/globals';
import { part1 } from './day07';
import { readInput } from './lib';

describe('tests day 7 sample', () => {
  const input = `
16,1,2,0,4,2,7,1,2,14
`;
  it('aligns the crabs', () => {
    expect(part1(input)).toBe(37);
    expect(part1(input, true)).toBe(168);
  });
});

describe('solves day 7', () => {
  const input = readInput(7);
  it('aligns the crabs', () => {
    expect(part1(input)).toBe(344297);
    expect(part1(input, true)).toBe(97164301);
  });
});
