import { readFileSync } from 'node:fs';
import * as path from 'node:path';

export function readInput(d: number): string {
  const day = String(d).padStart(2, '0');
  return readFileSync(path.join(__dirname, `./day${day}.txt`), 'utf-8');
}
