import { describe, it, expect } from "@jest/globals";
import { readInput } from "./lib";
import { part1, part2 } from "./day03";

describe("tests day 3", () => {
  const input = `
00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010
`;

  it("calculates the correct power consumption and life support", () => {
    expect(part1(input)).toBe(198);
    expect(part2(input)).toBe(230);
  });
});

describe("solves day 3", () => {
  const input = readInput(3);
  it("calculates the correct power consumption and life support", () => {
    expect(part1(input)).toBe(2724524);
    expect(part2(input)).toBe(2775870);
  });
});
