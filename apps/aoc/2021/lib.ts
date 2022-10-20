import { readFileSync } from 'fs';
import * as path from 'path';

export function readInput(d: number): string {
  const day = String(d).padStart(2, "0");
  return readFileSync(path.join(__dirname, `./day${day}.txt`), 'utf-8');
};
