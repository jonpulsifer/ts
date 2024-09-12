function parse(s: string): string[] {
  return s.trim().split('\n');
}

export function part1(input: string): number {
  const readings = parse(input);
  const counts: number[] = Array(readings[0].length).fill(0);
  const mid = readings.length / 2;
  let gamma = '';
  let epsilon = '';

  for (const reading of readings) {
    for (let i = 0; i < reading.length; i++) {
      if (Number(reading[i]) === 1) counts[i]++;
    }
  }

  for (const count of counts) {
    const g = count > mid ? '1' : '0';
    const e = count > mid ? '0' : '1';
    gamma = gamma + g;
    epsilon = epsilon + e;
  }

  return Number.parseInt(gamma, 2) * Number.parseInt(epsilon, 2);
}

export function part2(input: string): number {
  const readings = parse(input);
  const co2: string[] = part2Filter(readings);
  const o2: string[] = part2Filter(readings, 'o2');
  return Number.parseInt(o2[0], 2) * Number.parseInt(co2[0], 2);
}

function part2Filter(input: string[], criteria?: string): string[] {
  let readings = input;
  const bits = readings[0].length;
  for (let bit = 0; bit < bits; bit++) {
    let zeroes = 0;
    let ones = 0;
    for (const reading of readings) {
      if (readings.length === 1) return readings;
      reading[bit] === '1' ? ones++ : zeroes++;
    }
    const most = ones >= zeroes ? '1' : '0';
    const least = ones >= zeroes ? '0' : '1';
    const filter = criteria === 'o2' ? most : least;
    readings = readings.filter((v) => {
      return v[bit] === filter;
    });
  }
  return readings;
}
