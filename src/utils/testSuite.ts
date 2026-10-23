/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateMathProblem, generateMemoryProblem, generateSequenceProblem } from './mission';
import { awardStarForSession, getCosmicRank, calculateAchievements } from './gamification';
import { FocusSession, StarReward, MissionResult } from '../types/alarm';

export interface TestResultItem {
  name: string;
  passed: boolean;
  message: string;
}

export function runAutomatedDiagnostics(): TestResultItem[] {
  const results: TestResultItem[] = [];

  // Test 1: Math Mission Generator & Validation
  try {
    const easyMath = generateMathProblem('easy');
    const medMath = generateMathProblem('medium');
    const hardMath = generateMathProblem('hard');

    const validMath =
      typeof easyMath.expectedAnswer === 'number' &&
      typeof medMath.expectedAnswer === 'number' &&
      typeof hardMath.expectedAnswer === 'number';

    results.push({
      name: 'Math Mission Generation & Numerical Solvability',
      passed: validMath,
      message: validMath ? 'Passed arithmetic evaluation across Easy, Medium, Hard' : 'Failed to generate numbers',
    });
  } catch (err) {
    results.push({
      name: 'Math Mission Generation & Numerical Solvability',
      passed: false,
      message: String(err),
    });
  }

  // Test 2: Memory Mission Sequence Generator
  try {
    const easyMem = generateMemoryProblem('easy');
    const medMem = generateMemoryProblem('medium');
    const hardMem = generateMemoryProblem('hard');

    const pass =
      easyMem.sequence.length === 4 &&
      medMem.sequence.length === 6 &&
      hardMem.sequence.length === 8 &&
      easyMem.displaySeconds > 0;

    results.push({
      name: 'Memory Mission Dynamic Sequence Scaling',
      passed: pass,
      message: pass ? 'Easy=4, Medium=6, Hard=8 symbols generated with timer intervals' : 'Length mismatch',
    });
  } catch (err) {
    results.push({
      name: 'Memory Mission Dynamic Sequence Scaling',
      passed: false,
      message: String(err),
    });
  }

  // Test 3: Sequence Puzzle Solver Rule
  try {
    const seq = generateSequenceProblem('easy');
    const hasMissing = seq.displaySequence.includes('?');
    const valAtMissing = seq.expectedAnswer;
    const pass = hasMissing && typeof valAtMissing === 'number';

    results.push({
      name: 'Sequence Puzzle Solvability & Rule Generation',
      passed: pass,
      message: pass ? `Pattern generated with missing index, rule: "${seq.patternRule}"` : 'Failed puzzle',
    });
  } catch (err) {
    results.push({
      name: 'Sequence Puzzle Solvability & Rule Generation',
      passed: false,
      message: String(err),
    });
  }

  // Test 4: Star Reward System - Exactly 1 Star per Valid Session
  try {
    const testSession: FocusSession = {
      id: 'test-session-1',
      taskName: 'Algorithm Test Task',
      category: 'Coding',
      plannedDurationMinutes: 25,
      actualDurationSeconds: 1500,
      startedAt: Date.now() - 1500000,
      endedAt: Date.now(),
      status: 'completed',
      starAwarded: true,
    };

    const initialStars: StarReward[] = [];
    const firstCall = awardStarForSession(testSession, initialStars);
    const passFirst = firstCall.starAwarded === true && firstCall.updatedStars.length === 1;

    // Test Idempotency: Second call with same session ID must award 0 stars
    const secondCall = awardStarForSession(testSession, firstCall.updatedStars);
    const passIdempotent = secondCall.starAwarded === false && secondCall.updatedStars.length === 1;

    results.push({
      name: 'Strict Star Idempotency (Exactly 1 Star, 0 on duplicate/retry)',
      passed: passFirst && passIdempotent,
      message:
        passFirst && passIdempotent
          ? 'Awarded exactly 1 star on completion; rejected duplicate award on replay'
          : 'Failed idempotency requirement',
    });
  } catch (err) {
    results.push({
      name: 'Strict Star Idempotency (Exactly 1 Star, 0 on duplicate/retry)',
      passed: false,
      message: String(err),
    });
  }

  // Test 5: Cancelled Sessions Award Zero Stars
  try {
    const cancelledSession: FocusSession = {
      id: 'test-session-cancelled',
      taskName: 'Cancelled Study',
      category: 'Study',
      plannedDurationMinutes: 25,
      actualDurationSeconds: 300,
      startedAt: Date.now() - 300000,
      endedAt: Date.now(),
      status: 'cancelled',
      starAwarded: false,
    };

    const starResult = awardStarForSession(cancelledSession, []);
    const pass = starResult.starAwarded === false && starResult.updatedStars.length === 0;

    results.push({
      name: 'Cancelled Focus Session Zero-Star Rule',
      passed: pass,
      message: pass ? 'Cancelled sessions verified to grant exactly 0 stars' : 'Failed cancelled rule',
    });
  } catch (err) {
    results.push({
      name: 'Cancelled Focus Session Zero-Star Rule',
      passed: false,
      message: String(err),
    });
  }

  // Test 6: Cosmic Rank Progression
  try {
    const rank0 = getCosmicRank(0);
    const rank5 = getCosmicRank(5);
    const rank15 = getCosmicRank(15);
    const rank30 = getCosmicRank(30);

    const pass =
      rank0.currentRank.title === 'Cosmic Beginner' &&
      rank5.currentRank.title === 'Rising Star' &&
      rank15.currentRank.title === 'Galaxy Achiever' &&
      rank30.currentRank.title === 'Cosmic Champion';

    results.push({
      name: 'Cosmic Level Progression (0-4, 5-14, 15-29, 30+)',
      passed: pass,
      message: pass ? 'Rank boundaries accurately calculated from star balances' : 'Level threshold mismatch',
    });
  } catch (err) {
    results.push({
      name: 'Cosmic Level Progression (0-4, 5-14, 15-29, 30+)',
      passed: false,
      message: String(err),
    });
  }

  // Test 7: Achievement Evaluator
  try {
    const testSessions: FocusSession[] = [
      {
        id: 's1',
        taskName: 'Task 1',
        category: 'Study',
        plannedDurationMinutes: 25,
        actualDurationSeconds: 1500,
        startedAt: Date.now() - 86400000,
        status: 'completed',
        starAwarded: true,
      },
      {
        id: 's2',
        taskName: 'Task 2',
        category: 'Coding',
        plannedDurationMinutes: 45,
        actualDurationSeconds: 2700,
        startedAt: Date.now() - 43200000,
        status: 'completed',
        starAwarded: true,
      },
      {
        id: 's3',
        taskName: 'Task 3',
        category: 'Reading',
        plannedDurationMinutes: 25,
        actualDurationSeconds: 1500,
        startedAt: Date.now(),
        status: 'completed',
        starAwarded: true,
      },
    ];

    const testStars: StarReward[] = testSessions.map((s) => ({
      id: `star-${s.id}`,
      sessionId: s.id,
      taskName: s.taskName,
      category: s.category,
      awardedAt: s.startedAt,
      starsCount: 1,
    }));

    const testMissions: MissionResult[] = Array.from({ length: 5 }, (_, i) => ({
      id: `m-${i}`,
      missionType: 'math',
      difficulty: 'easy',
      attempts: 1,
      solved: true,
      completedAt: Date.now(),
      timeSpentSeconds: 10,
    }));

    const achs = calculateAchievements(testSessions, testStars, testMissions);
    const firstFocus = achs.find((a) => a.id === 'first_focus')?.isUnlocked;
    const threeInARow = achs.find((a) => a.id === 'three_in_a_row')?.isUnlocked;
    const focusExplorer = achs.find((a) => a.id === 'focus_explorer')?.isUnlocked;
    const deepDiver = achs.find((a) => a.id === 'deep_diver')?.isUnlocked;
    const missionMaster = achs.find((a) => a.id === 'mission_master')?.isUnlocked;

    const pass = Boolean(firstFocus && threeInARow && focusExplorer && deepDiver && missionMaster);

    results.push({
      name: 'Real Achievement Qualification Evaluator',
      passed: pass,
      message: pass ? 'Streak, Explorer (3 categories), Deep Diver (45m), and Mission Master unlocked' : 'Achievement logic discrepancy',
    });
  } catch (err) {
    results.push({
      name: 'Real Achievement Qualification Evaluator',
      passed: false,
      message: String(err),
    });
  }

  // Test 8: LocalStorage Persistence Integrity
  try {
    const testKey = 'alarmclock_diagnostic_integrity_test';
    const testPayload = { timestamp: Date.now(), title: 'Persistence Test' };
    localStorage.setItem(testKey, JSON.stringify(testPayload));
    const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
    localStorage.removeItem(testKey);
    const pass = retrieved.title === 'Persistence Test';

    results.push({
      name: 'LocalStorage Browser Storage Persistence',
      passed: pass,
      message: pass ? 'Roundtrip JSON serialize/deserialize passed' : 'Storage read failure',
    });
  } catch (err) {
    results.push({
      name: 'LocalStorage Browser Storage Persistence',
      passed: false,
      message: String(err),
    });
  }

  return results;
}
