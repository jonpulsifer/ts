function parse(s: string): Array<[string, number]> {
  return s
    .trim()
    .split('\n')
    .map((e) => {
      const [direction, amount] = e.split(' ');
      return [direction, Number(amount)];
    });
}

export function part1(input: string): number {
  let distance = 0;
  let depth = 0;

  const movements = parse(input);
  for (const [direction, amount] of movements) {
    switch (direction) {
      case 'forward':
        distance += amount;
        break;
      case 'down':
        depth += amount;
        break;
      case 'up':
        depth -= amount;
        break;
    }
  }
  return depth * distance;
}

export function part2(input: string): number {
  let aim = 0;
  let distance = 0;
  let depth = 0;

  const movements = parse(input);
  for (const [direction, amount] of movements) {
    switch (direction) {
      case 'forward':
        distance += amount;
        depth += aim * amount;
        break;
      case 'down':
        aim += amount;
        break;
      case 'up':
        aim -= amount;
        break;
    }
  }
  return depth * distance;
}
