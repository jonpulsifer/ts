function parse(s: string): Map<number, number> {
  const arr = s.trim().split(',').map(Number);
  const unique = [...new Set(arr)];
  const map: Map<number, number> = new Map();
  unique.forEach((v) => {
    map.set(v, arr.filter((e) => e === v).length);
  });
  return map;
}

export function part1(input: string, days: number): number {
  const fresh = 8;
  const reset = 6;
  const fishmap = parse(input);
  for (let day = 0; day < days; day++) {
    const zeroes = fishmap.get(0) || 0;
    for (let age = 1; age <= fresh; age++) {
      if (age > 0) fishmap.set(age - 1, fishmap.get(age) || 0);
    }
    fishmap.set(reset, (fishmap.get(reset) || 0) + zeroes);
    fishmap.set(fresh, zeroes);
  }
  return [...fishmap.values()].reduce((p, v) => p + v);
}
