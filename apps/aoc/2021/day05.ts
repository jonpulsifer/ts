function parse(s: string): number[][][] {
  return s
    .trim()
    .split("\n")
    .map((v) => {
      return v.split("->").map((v) => {
        return v.trim().split(",").map(Number);
      });
    });
}

export function solve(
  input: string,
  boardsize: number,
  diagonals: boolean
): number {
  let board = new Array(boardsize).fill(0).map((a) => {
    return new Array(boardsize).fill(0);
  });
  const coords = parse(input);
  for (const coord of coords) {
    const pos1 = coord[0];
    const pos2 = coord[1];
    const x1 = pos1[0],
      y1 = pos1[1],
      x2 = pos2[0],
      y2 = pos2[1];

    const diagonal = x1 !== x2 && y1 !== y2;
    if (!diagonals && diagonal) continue;

    const slope = x1 === x2 ? 0 : (y2 - y1) / (x2 - x1);
    const m = slope;
    const b = y2 - m * x2;

    const points: number[][] = [];
    const starty = y1 < y2 ? y1 : y2;
    const endy = y1 < y2 ? y2 : y1;
    const startx = x1 < x2 ? x1 : x2;
    const endx = x1 < x2 ? x2 : x1;

    if (slope === 0) {
      if (x1 === x2) {
        for (let y = starty; y <= endy; y++) {
          points.push([x1, y]);
        }
      }
      if (y1 === y2) {
        for (let x = startx; x <= endx; x++) {
          points.push([x, y1]);
        }
      }
    } else {
      for (let x = startx; x <= endx; x++) {
        const y = m * x + b;
        //console.log(`${y} = (${m} * ${x}) + ${b}`);
        points.push([x, y]);
      }
    }
    for (const point of points) {
      board[point[1]][point[0]]++;
    }
  }
  const count = board.flat(2).filter((e) => e > 1).length;
  return count;
}
