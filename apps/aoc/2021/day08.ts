function parse(s: string): string[][][] {
  return s
    .trim()
    .split('\n')
    .map((v) => v.split('|'))
    .map((v) => v.map((e) => e.trim().split(' ')));
}

export function part1(input: string): number {
  const entries = parse(input);
  const criteria = [2, 3, 4, 7];
  const results: string[] = [];
  for (const [_, output] of entries) {
    for (const digit of output) {
      if (criteria.includes(digit.length)) results.push(digit);
    }
  }
  return results.length;
}

const includes = (s1: string, s2: string) => {
  return s2.split('').every((e) => s1.split('').includes(e));
};

const doesNotInclude = (s1: string, s2: string) => {
  return !includes(s1, s2);
};

const sort = (arr: string[]) => {
  return arr.map((v) => v.split('').sort().join('')); // sort alphabetically
};

export function part2(input: string): number {
  const entries = parse(input);
  let sum = 0;
  for (const [p, o] of entries) {
    const digits: Map<number, string> = new Map();
    const patterns = sort(p);
    const outputs = sort(o);
    digits.set(1, patterns.find((v) => v.length === 2) || ''); // 1, 4, 7, 8
    digits.set(4, patterns.find((v) => v.length === 4) || '');
    digits.set(7, patterns.find((v) => v.length === 3) || '');
    digits.set(8, patterns.find((v) => v.length === 7) || '');
    digits.set(
      3,
      patterns.find(
        (v) => v.length === 5 && includes(v, digits.get(7) || ''),
      ) || '',
    );
    patterns
      .filter((v) => v.length === 6)
      .forEach((pattern) => {
        // 0, 6, 9
        if (includes(pattern, digits.get(3) || '')) {
          digits.set(9, pattern);
        } else if (
          includes(pattern, digits.get(7) || '') &&
          doesNotInclude(pattern, digits.get(3) || '')
        ) {
          digits.set(0, pattern);
        } else {
          digits.set(6, pattern);
        }
      });
    patterns
      .filter((v) => v.length === 5)
      .forEach((pattern) => {
        // 2, 3, 5
        if (doesNotInclude(pattern, digits.get(7) || '')) {
          if (includes(digits.get(6) || '', pattern)) {
            digits.set(5, pattern);
          } else {
            digits.set(2, pattern);
          }
        }
      });
    const letters: Map<string, number> = new Map(
      Array.from(digits, (a) => [a[1], a[0]]),
    );
    sum += parseInt(outputs.map((v) => letters.get(v) || 0).join(''), 10);
  }

  return sum;
}
