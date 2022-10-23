function parse(s: string): number[][] {
  return s
    .trim()
    .split("\n")
    .map((v) => v.split("").map(Number));
}

const isLowPoint = (y: number, x: number, map: number[][]): boolean => {
  const middle = map[y][x];
  const top = map[y - 1] ? map[y - 1][x] : NaN;
  const bottom = map[y + 1] ? map[y + 1][x] : NaN;
  const left = map[y][x - 1] !== undefined ? map[y][x - 1] : NaN;
  const right = map[y][x + 1] !== undefined ? map[y][x + 1] : NaN;
  const criteria = [top, bottom, left, right].filter((v) => !isNaN(v));
  return criteria.every((n) => n > middle);
};

export function part1(input: string): number {
  const readings = parse(input);
  const lowPoints: number[] = [];
  for (let i = 0; i < readings.length; i++) {
    for (let j = 0; j < readings[i].length; j++) {
      if (isLowPoint(i, j, readings)) lowPoints.push(readings[i][j]);
    }
  }
  return lowPoints
    .map((n) => n + 1)
    .reduce((p, v) => {
      return p + v;
    });
}

type Point = {
  x: number;
  y: number;
  value: number;
};

type Basin = Point[];

export function part2(input: string): number {
  const readings = parse(input);
  const basins: Basin[] = [];
  let basin = false;

  for (let i = 0; i < readings.length; i++) {
    basin = false;
    for (let j = 0; j < readings[0].length; j++) {
      let reading: Point;
      if (readings[i][j] === 9) continue;
      reading = {
        x: j,
        y: i,
        value: readings[i][j],
      };
      basins.push([reading]);
    }
  }
  console.log(basins.sort((a, b) => b.length - a.length).slice(3));
  return 0;
}
