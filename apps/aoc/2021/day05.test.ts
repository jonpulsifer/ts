import { describe, expect, it } from "@jest/globals";
import { readInput } from "./lib";
import { solve } from "./day05";

describe("tests day 5", () => {
  const input = `
0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2
`;
  it("finds intersections", () => {
    expect(solve(input, 10, false)).toBe(5);
    expect(solve(input, 10, true)).toBe(12);
  });
});
describe("solves day 5", () => {
  const input = readInput(5);
  it("finds intersections", () => {
    expect(solve(input, 1000, false)).toBe(6397);
    expect(solve(input, 1000, true)).toBe(22335);
  });
});
