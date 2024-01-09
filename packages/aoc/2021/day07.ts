function parse(s: string): number[] {
  return s.trim().split(',').map(Number);
}

export function part1(input: string, premium = false): number {
  const crabs = parse(input);
  const rate = premium
    ? (fuel: number) => (fuel * (fuel + 1)) / 2
    : (fuel: number) => fuel;
  const min = Math.min(...crabs);
  const max = Math.max(...crabs);

  let fuel = Number.POSITIVE_INFINITY;
  for (let range = min; range < max; range++) {
    const spent = crabs
      .map((pos) => rate(Math.abs(pos - range)))
      .reduce((p, v) => p + v);
    if (spent < fuel) fuel = spent;
  }
  return fuel;
}
