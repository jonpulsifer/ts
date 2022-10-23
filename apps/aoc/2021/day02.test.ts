import { describe, it, expect } from "@jest/globals";
import { part1, part2 } from "./day02";
import { readInput } from "./lib";

describe("tests day two", () => {
  const input = `
forward 5
down 5
forward 8
up 3
down 8
forward 2
`;

  it("tests the seven seas", () => {
    expect(part1(input)).toBe(150);
    expect(part2(input)).toBe(900);
  });
});

describe("solves day two", () => {
  const input = readInput(2);
  it("sails the seven seas", () => {
    expect(part1(input)).toBe(2036120);
    expect(part2(input)).toBe(2015547716);
  });
});
