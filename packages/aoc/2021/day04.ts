function parse(s: string): [number[], any] {
  const lines = s.trim().split('\n');
  const numbers: number[] = lines[0].split(',').map(Number);
  const cards = [];
  for (let l = 2; l < lines.length; l = l + 6) {
    const card = [];
    for (let i = 0; i < 5; i++) {
      const row = lines[l + i].match(/\d+/g);
      card.push(row);
    }
    cards.push(card);
  }
  return [numbers, cards];
}

function mark(
  called: number,
  cards: Array<Array<number[]>>,
): Array<Array<number[]>> {
  for (const card of cards) {
    for (const row of card) {
      for (const i in row) {
        if (Number(row[i]) === called) {
          row.splice(Number(i), 1, Number.POSITIVE_INFINITY);
        }
      }
    }
  }
  return cards;
}

function check(
  cards: Array<Array<number[]>>,
): [Array<Array<number[]>>, Array<Array<number[]>>] {
  const winners: Array<Array<number[]>> = [];
  for (let i = cards.length - 1; i >= 0; i--) {
    let winner = false;
    // if (winners.length > 0) break;
    for (const row of cards[i]) {
      if (
        row.every((v) => {
          return v === Number.POSITIVE_INFINITY;
        })
      ) {
        winners.push(cards[i]);
        cards.splice(i, 1);
        winner = true;
        break;
      }
    }
    if (winner) continue;
    for (let col = 0; col < cards[0].length; col++) {
      const entries: number[] = [];
      for (const row of cards[i]) {
        entries.push(row[col]);
      }
      if (
        entries.every((v) => {
          return v === Number.POSITIVE_INFINITY;
        })
      ) {
        winners.push(cards[i]);
        cards.splice(i, 1);
        break;
      }
    }
  }
  return [winners, cards];
}

export function part1(input: string): number {
  const [numbers, c] = parse(input);
  let cards = c;

  let winners: Array<Array<number[]>> = [];
  for (const called of numbers) {
    // mark numbers
    cards = mark(called, cards);

    // check winners
    const results = check(cards);
    winners = results[0];
    cards = results[1];
    for (const winner of winners) {
      const unmarked: number[] = [];
      for (const row of winner) {
        for (const num of row) {
          if (num !== Number.POSITIVE_INFINITY) unmarked.push(num);
        }
      }
      const sum = unmarked.reduce((p, v) => {
        return Number(p) + Number(v);
      });
      return sum * called;
    }
  }
  return 0;
}

export function part2(input: string): number {
  const [numbers, c] = parse(input);
  let cards: Array<Array<number[]>> = c;
  let winners: Array<Array<number[]>> = [];
  let last = -1;
  for (let i = 0; i < numbers.length; i++) {
    const called = numbers[i];
    if (cards.length > 0) {
      last = called;
      // mark numbers
      cards = mark(called, cards);

      // check winners
      const results = check(cards);
      winners = winners.concat(results[0]);
      cards = results[1];
    } else {
      break;
    }
  }
  const unmarked: number[] = [];
  const winner = winners[winners.length - 1];
  for (const row of winner) {
    for (const num of row) {
      if (num !== Number.POSITIVE_INFINITY) unmarked.push(num);
    }
  }
  const sum = unmarked.reduce((p, v) => {
    return Number(p) + Number(v);
  });
  return sum * last;
}
