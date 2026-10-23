/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MissionConfig } from '../../types/alarm';
import { MathMission } from './MathMission';
import { MemoryMission } from './MemoryMission';
import { SequenceMission } from './SequenceMission';

interface MissionSolverProps {
  missionConfig: MissionConfig;
  onSuccess: (attempts: number, timeSpentSeconds: number) => void;
  isPractice?: boolean;
}

export const MissionSolver: React.FC<MissionSolverProps> = ({
  missionConfig,
  onSuccess,
  isPractice = false,
}) => {
  switch (missionConfig.type) {
    case 'memory':
      return (
        <MemoryMission
          difficulty={missionConfig.difficulty}
          onSuccess={onSuccess}
          isPractice={isPractice}
        />
      );
    case 'sequence':
      return (
        <SequenceMission
          difficulty={missionConfig.difficulty}
          onSuccess={onSuccess}
          isPractice={isPractice}
        />
      );
    case 'math':
    default:
      return (
        <MathMission
          difficulty={missionConfig.difficulty}
          onSuccess={onSuccess}
          isPractice={isPractice}
        />
      );
  }
};
