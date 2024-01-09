function parse(s: string): number[] {
  return s.trim().split('\n').map(Number);
}

export function part1(input: string): number {
  const nums = parse(input);
  let counter = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) counter++;
  }
  return counter;
}

export function part2(input: string): number {
  const nums = parse(input);
  let counter = 0;
  let previous = Number.POSITIVE_INFINITY;
  for (let i = 2; i < nums.length; i++) {
    const sum = nums[i] + nums[i - 1] + nums[i - 2];
    if (sum > previous) counter++;
    previous = sum;
  }
  return counter;
}
