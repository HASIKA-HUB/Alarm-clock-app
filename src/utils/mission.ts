/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MissionDifficulty } from '../types/alarm';

// --- Math Challenge Generator ---
export interface MathProblem {
  question: string;
  expectedAnswer: number;
}

export function generateMathProblem(difficulty: MissionDifficulty): MathProblem {
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (difficulty === 'easy') {
    const op = ['+', '-', '*'][randInt(0, 2)];
    if (op === '+') {
      const a = randInt(12, 65);
      const b = randInt(8, 45);
      return { question: `${a} + ${b}`, expectedAnswer: a + b };
    } else if (op === '-') {
      const a = randInt(25, 95);
      const b = randInt(10, a - 5);
      return { question: `${a} - ${b}`, expectedAnswer: a - b };
    } else {
      const a = randInt(3, 12);
      const b = randInt(3, 9);
      return { question: `${a} × ${b}`, expectedAnswer: a * b };
    }
  } else if (difficulty === 'medium') {
    const type = randInt(0, 2);
    if (type === 0) {
      // 3-term mix
      const a = randInt(20, 60);
      const b = randInt(15, 40);
      const c = randInt(10, 30);
      return { question: `${a} + ${b} - ${c}`, expectedAnswer: a + b - c };
    } else if (type === 1) {
      // Multiplication then subtraction/addition
      const a = randInt(6, 14);
      const b = randInt(6, 12);
      const c = randInt(12, 45);
      return { question: `${a} × ${b} - ${c}`, expectedAnswer: a * b - c };
    } else {
      // Division then addition
      const divisor = randInt(3, 9);
      const quotient = randInt(6, 15);
      const dividend = divisor * quotient;
      const c = randInt(15, 45);
      return { question: `${dividend} ÷ ${divisor} + ${c}`, expectedAnswer: quotient + c };
    }
  } else {
    // Hard
    const type = randInt(0, 2);
    if (type === 0) {
      const a = randInt(14, 25);
      const b = randInt(7, 16);
      const c = randInt(30, 95);
      return { question: `(${a} × ${b}) - ${c}`, expectedAnswer: a * b - c };
    } else if (type === 1) {
      const div = randInt(6, 16);
      const quo = randInt(12, 24);
      const num = div * quo;
      const mult = randInt(4, 9);
      const sub = randInt(20, 50);
      return { question: `(${num} ÷ ${div}) × ${mult} - ${sub}`, expectedAnswer: quo * mult - sub };
    } else {
      const a = randInt(16, 32);
      const b = randInt(12, 28);
      const c = randInt(15, 50);
      return { question: `${a} × ${b} + ${c}`, expectedAnswer: a * b + c };
    }
  }
}

// --- Memory Challenge Generator ---
export const COSMIC_SYMBOLS = [
  { id: 'star', symbol: '⭐', label: 'Star' },
  { id: 'planet', symbol: '🪐', label: 'Saturn' },
  { id: 'rocket', symbol: '🚀', label: 'Rocket' },
  { id: 'moon', symbol: '🌙', label: 'Crescent' },
  { id: 'comet', symbol: '☄️', label: 'Comet' },
  { id: 'alien', symbol: '🛸', label: 'UFO' },
  { id: 'satellite', symbol: '🛰️', label: 'Probe' },
  { id: 'sun', symbol: '☀️', label: 'Sun' },
  { id: 'galaxy', symbol: '🌌', label: 'Nebula' },
];

export interface MemoryProblem {
  sequence: typeof COSMIC_SYMBOLS;
  displaySeconds: number;
}

export function generateMemoryProblem(difficulty: MissionDifficulty): MemoryProblem {
  const length = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const displaySeconds = difficulty === 'easy' ? 3.5 : difficulty === 'medium' ? 4.5 : 6.0;

  const sequence: typeof COSMIC_SYMBOLS = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * COSMIC_SYMBOLS.length);
    sequence.push(COSMIC_SYMBOLS[randomIndex]);
  }

  return { sequence, displaySeconds };
}

// --- Sequence Puzzle Generator ---
export interface SequenceProblem {
  displaySequence: (number | string)[];
  missingIndex: number;
  expectedAnswer: number;
  patternRule: string;
}

export function generateSequenceProblem(difficulty: MissionDifficulty): SequenceProblem {
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (difficulty === 'easy') {
    // Arithmetic step progression (e.g. +3, +4, +5, +7)
    const step = randInt(3, 9);
    const start = randInt(2, 20);
    const length = 5;
    const fullSeq = Array.from({ length }, (_, i) => start + i * step);
    const missingIndex = randInt(1, 3);
    const expectedAnswer = fullSeq[missingIndex];
    const displaySequence: (number | string)[] = fullSeq.map((val, idx) => (idx === missingIndex ? '?' : val));

    return {
      displaySequence,
      missingIndex,
      expectedAnswer,
      patternRule: `Arithmetic progression increasing by +${step}`,
    };
  } else if (difficulty === 'medium') {
    const type = randInt(0, 1);
    if (type === 0) {
      // Geometric / Doubling / Tripling
      const factor = randInt(2, 3);
      const start = randInt(2, 6);
      const length = 5;
      const fullSeq = Array.from({ length }, (_, i) => start * Math.pow(factor, i));
      const missingIndex = randInt(1, 3);
      const expectedAnswer = fullSeq[missingIndex];
      const displaySequence: (number | string)[] = fullSeq.map((val, idx) => (idx === missingIndex ? '?' : val));

      return {
        displaySequence,
        missingIndex,
        expectedAnswer,
        patternRule: `Geometric progression multiplying by ×${factor}`,
      };
    } else {
      // Alternating step (+a, -b)
      const a = randInt(4, 8);
      const b = randInt(1, 3);
      const start = randInt(10, 25);
      const fullSeq: number[] = [start];
      for (let i = 1; i < 6; i++) {
        if (i % 2 === 1) {
          fullSeq.push(fullSeq[i - 1] + a);
        } else {
          fullSeq.push(fullSeq[i - 1] - b);
        }
      }
      const missingIndex = randInt(1, 4);
      const expectedAnswer = fullSeq[missingIndex];
      const displaySequence: (number | string)[] = fullSeq.map((val, idx) => (idx === missingIndex ? '?' : val));

      return {
        displaySequence,
        missingIndex,
        expectedAnswer,
        patternRule: `Alternating sequence (+${a}, -${b})`,
      };
    }
  } else {
    // Hard: Fibonacci style or Perfect Squares
    const type = randInt(0, 1);
    if (type === 0) {
      // Fibonacci addition
      const a = randInt(2, 6);
      const b = randInt(4, 9);
      const fullSeq = [a, b];
      for (let i = 2; i < 6; i++) {
        fullSeq.push(fullSeq[i - 1] + fullSeq[i - 2]);
      }
      const missingIndex = randInt(2, 4);
      const expectedAnswer = fullSeq[missingIndex];
      const displaySequence: (number | string)[] = fullSeq.map((val, idx) => (idx === missingIndex ? '?' : val));

      return {
        displaySequence,
        missingIndex,
        expectedAnswer,
        patternRule: `Fibonacci sum (each term is the sum of previous two)`,
      };
    } else {
      // Squares sequence: n^2
      const startN = randInt(2, 7);
      const length = 5;
      const fullSeq = Array.from({ length }, (_, i) => Math.pow(startN + i, 2));
      const missingIndex = randInt(1, 3);
      const expectedAnswer = fullSeq[missingIndex];
      const displaySequence: (number | string)[] = fullSeq.map((val, idx) => (idx === missingIndex ? '?' : val));

      return {
        displaySequence,
        missingIndex,
        expectedAnswer,
        patternRule: `Consecutive square numbers`,
      };
    }
  }
}
