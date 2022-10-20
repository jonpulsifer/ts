import fetch from 'cross-fetch';
import { mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';

async function fetchInput(url: string, cookie: string): Promise<string> {
  const headers = {
    cookie: `session=${cookie}`
  }

  const response = await fetch(
    url,
    { headers }
  );
  if (response.ok) return await response.text();
  throw new Error(`Could not download input from ${url}`);
};

function saveInput(): void {
  const cookie = process.env.AOC_SESSION_COOKIE || '';
  if (!cookie) throw new Error('AOC session cookie not set');

  const now = new Date();
  const year = process.argv[2] || now.getFullYear().toString();
  const day = process.argv[3] || now.getDate().toString();
  const outputDir = path.resolve('.', year);
  try {
    mkdirSync(outputDir);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw new Error(`${error.code}: could not create directory`);
    };
  };

  const url = `https://adventofcode.com/${year}/day/${day}/input`;
  fetchInput(url, cookie).then(input => {
    writeFileSync(path.resolve(outputDir, `day${day.padStart(2, '0')}.txt`), input);
    console.log(`Wrote ${input.length} bytes to ${outputDir}`);
  });
}

saveInput();
