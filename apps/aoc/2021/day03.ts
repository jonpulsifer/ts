function parse(s: string): string[] {
  return s.trim().split('\n');
};

export function part1(input: string): number {
  const readings = parse(input);
  const counts: number[] = Array(readings[0].length).fill(0);
  let mid = readings.length / 2;
  let gamma = '';
  let epsilon = '';

  for (const reading of readings) {
    for (var i = 0; i < reading.length; i++) {
      if (Number(reading[i]) === 1) counts[i]++
    }
  }

  for (const count of counts) {
    const g = (count > mid) ? '1' : '0';
    const e = (count > mid) ? '0' : '1';
    gamma = gamma + g;
    epsilon = epsilon + e;
  }

  return parseInt(gamma, 2) * parseInt(epsilon, 2);
}

export function part2(input: string): number {
  const readings = parse(input);
  let co2: string[] = part2Filter(readings);
  let o2: string[] = part2Filter(readings, 'o2');
  return parseInt(o2[0],2) * parseInt(co2[0],2);
};

function part2Filter(input: string[], criteria?: string): string[] {
  const bits = input[0].length;
  for (let bit = 0; bit < bits; bit++) {
    let zeroes = 0;
    let ones = 0;
    for (const reading of input) {
      if (input.length === 1) return input;
      (reading[bit] === '1') ? ones++ : zeroes ++;
    }
    const most = (ones >= zeroes) ? '1' : '0';
    const least = (ones >= zeroes) ? '0' : '1';
    const filter = (criteria === 'o2') ? most : least;
    input = input.filter((v) => { return v[bit] === filter; });
  };
  return input;
}
