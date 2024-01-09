import { describe, it, expect } from '@jest/globals';
import { readInput } from './lib';
import { part1, part2 } from './day09';

describe('tests day 9', () => {
  const input = `
2199943210
3987894921
9856789892
8767896789
9899965678
`;
  it('calculates the risk of smoke', () => {
    expect(part1(input)).toBe(15);
  });
  // it("finds the biggest basins", () => {
  //  expect(part2(input)).toBe(0);
  // });
});

describe('solves day 9', () => {
  const input = readInput(9);
  it('calculates the risk of smoke', () => {
    expect(part1(input)).toBe(452);
  });
  //it("finds the biggest basins", () => {
  //  expect(part2(input)).toBe(0);
  //});
});
