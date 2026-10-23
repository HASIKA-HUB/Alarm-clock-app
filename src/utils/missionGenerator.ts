import { 
  MathChallenge, 
  MemoryChallenge, 
  SequenceChallenge, 
  MissionDifficulty 
} from '../types/alarmclock';

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array helper
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates Math Challenge with validated integer answer
 */
export function generateMathChallenge(difficulty: MissionDifficulty): MathChallenge {
  if (difficulty === 'easy') {
    const op = randomInt(1, 3);
    if (op === 1) {
      // Simple addition
      const a = randomInt(12, 45);
      const b = randomInt(8, 38);
      return {
        question: `${a} + ${b}`,
        answer: a + b,
        difficulty,
      };
    } else if (op === 2) {
      // Simple subtraction
      const a = randomInt(25, 75);
      const b = randomInt(9, a - 5);
      return {
        question: `${a} - ${b}`,
        answer: a - b,
        difficulty,
      };
    } else {
      // Simple multiplication
      const a = randomInt(4, 9);
      const b = randomInt(3, 9);
      return {
        question: `${a} × ${b}`,
        answer: a * b,
        difficulty,
      };
    }
  }

  if (difficulty === 'medium') {
    const op = randomInt(1, 3);
    if (op === 1) {
      // 3-step addition and subtraction
      const a = randomInt(30, 80);
      const b = randomInt(15, 45);
      const c = randomInt(10, 30);
      return {
        question: `${a} - ${b} + ${c}`,
        answer: a - b + c,
        difficulty,
      };
    } else if (op === 2) {
      // 2-digit multiplication
      const a = randomInt(12, 19);
      const b = randomInt(4, 9);
      return {
        question: `${a} × ${b}`,
        answer: a * b,
        difficulty,
      };
    } else {
      // Clean division + addition
      const divisor = randomInt(4, 9);
      const quotient = randomInt(6, 12);
      const dividend = divisor * quotient;
      const add = randomInt(14, 35);
      return {
        question: `(${dividend} ÷ ${divisor}) + ${add}`,
        answer: quotient + add,
        difficulty,
      };
    }
  }

  // Hard difficulty
  const op = randomInt(1, 2);
  if (op === 1) {
    const a = randomInt(14, 25);
    const b = randomInt(6, 12);
    const c = randomInt(20, 60);
    return {
      question: `(${a} × ${b}) - ${c}`,
      answer: a * b - c,
      difficulty,
    };
  } else {
    const divisor = randomInt(6, 12);
    const quotient = randomInt(8, 15);
    const dividend = divisor * quotient;
    const mult = randomInt(4, 8);
    const subtract = randomInt(15, 45);
    return {
      question: `(${dividend} ÷ ${divisor}) × ${mult} - ${subtract}`,
      answer: quotient * mult - subtract,
      difficulty,
    };
  }
}

/**
 * Cosmic symbols and numbers for Memory Recall challenge
 */
const COSMIC_POOL = ['✦', '7', '★', '3', '🪐', '9', '◈', '4', '🚀', '5', '◆', '8'];

export function generateMemoryChallenge(difficulty: MissionDifficulty): MemoryChallenge {
  let length = 4;
  let duration = 3500;

  if (difficulty === 'medium') {
    length = 6;
    duration = 4200;
  } else if (difficulty === 'hard') {
    length = 8;
    duration = 5200;
  }

  // Pick random items
  const sequence: string[] = [];
  for (let i = 0; i < length; i++) {
    const item = COSMIC_POOL[randomInt(0, COSMIC_POOL.length - 1)];
    sequence.push(item);
  }

  // Ensure all symbols in the sequence are available in the options, plus distinct pool items
  const availableOptions = Array.from(new Set([...sequence, ...COSMIC_POOL.slice(0, 8)]));

  return {
    sequence,
    displayDurationMs: duration,
    difficulty,
    availableOptions: shuffle(availableOptions),
  };
}

/**
 * Missing Sequence Pattern challenge
 */
export function generateSequenceChallenge(difficulty: MissionDifficulty): SequenceChallenge {
  if (difficulty === 'easy') {
    // Arithmetic step progression, e.g. 3, 7, 11, ?, 19 (+4)
    const start = randomInt(2, 10);
    const step = randomInt(3, 7);
    const seq = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
    const missingIdx = randomInt(1, 3);
    const answer = seq[missingIdx];

    const displaySequence: (number | string)[] = [...seq];
    displaySequence[missingIdx] = '?';

    const fakeOptions = [answer + step, answer - step, answer + 2, answer - 3]
      .filter(o => o !== answer);
    const options = shuffle([answer, ...fakeOptions.slice(0, 3)]);

    return {
      displaySequence,
      answer,
      options,
      patternDescription: `Step increases by +${step} each time`,
      difficulty,
    };
  }

  if (difficulty === 'medium') {
    // Geometric or alternating
    const type = randomInt(1, 2);
    if (type === 1) {
      // Geometric doubling or tripling: 2, 4, 8, ?, 32 or 3, 9, 27
      const mult = randomInt(2, 3);
      const start = randomInt(2, 4);
      const seq = [start, start * mult, start * mult * mult, start * mult * mult * mult];
      const missingIdx = 2; // the 3rd or 4th
      const answer = seq[missingIdx];
      const displaySequence: (number | string)[] = [...seq];
      displaySequence[missingIdx] = '?';

      const options = shuffle([answer, answer * 2, answer - 4, answer + 8]);
      return {
        displaySequence,
        answer,
        options,
        patternDescription: `Each cosmic number is multiplied by ${mult}`,
        difficulty,
      };
    } else {
      // Alternating step: +5, -2, +5, -2
      const start = randomInt(10, 20);
      const up = randomInt(4, 7);
      const down = randomInt(2, 3);
      const s0 = start;
      const s1 = s0 + up;
      const s2 = s1 - down;
      const s3 = s2 + up;
      const s4 = s3 - down;
      const seq = [s0, s1, s2, s3, s4];
      const missingIdx = 3;
      const answer = seq[missingIdx];
      const displaySequence: (number | string)[] = [...seq];
      displaySequence[missingIdx] = '?';

      const options = shuffle([answer, answer + up, answer - down, answer + 1]);
      return {
        displaySequence,
        answer,
        options,
        patternDescription: `Alternating sequence (+${up}, -${down})`,
        difficulty,
      };
    }
  }

  // Hard: Perfect squares or Fibonacci
  const hardType = randomInt(1, 2);
  if (hardType === 1) {
    // Perfect squares offset: e.g. 1^2, 2^2, 3^2, 4^2, 5^2, 6^2
    const offset = randomInt(2, 4);
    const seq = [
      offset * offset,
      (offset + 1) * (offset + 1),
      (offset + 2) * (offset + 2),
      (offset + 3) * (offset + 3),
      (offset + 4) * (offset + 4),
    ];
    const missingIdx = 3;
    const answer = seq[missingIdx];
    const displaySequence: (number | string)[] = [...seq];
    displaySequence[missingIdx] = '?';

    const options = shuffle([answer, answer - 5, answer + 7, (offset + 3) * (offset + 4)]);
    return {
      displaySequence,
      answer,
      options,
      patternDescription: `Sequential squares: (n)²`,
      difficulty,
    };
  } else {
    // Fibonacci progression
    const a = randomInt(2, 4);
    const b = randomInt(3, 5);
    const c = a + b;
    const d = b + c;
    const e = c + d;
    const f = d + e;
    const seq = [a, b, c, d, e, f];
    const missingIdx = 4; // 'e'
    const answer = seq[missingIdx];
    const displaySequence: (number | string)[] = [...seq];
    displaySequence[missingIdx] = '?';

    const options = shuffle([answer, answer + 2, d + c - 3, answer + d]);
    return {
      displaySequence,
      answer,
      options,
      patternDescription: `Fibonacci sum: each term is the sum of previous two terms`,
      difficulty,
    };
  }
}
