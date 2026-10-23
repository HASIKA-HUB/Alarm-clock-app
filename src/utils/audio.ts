/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlarmSoundId } from '../types/alarm';

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private currentStopFn: (() => void) | null = null;
  private isUnlocked = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    if (this.isUnlocked) return;
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Play a tiny inaudible buffer to unlock iOS / Chrome audio policy
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.01);
      this.isUnlocked = true;
    } catch {
      // Ignore
    }
  }

  public stopAlarm(): void {
    if (this.currentStopFn) {
      try {
        this.currentStopFn();
      } catch {
        // Ignore
      }
      this.currentStopFn = null;
    }
  }

  public isAlarmPlaying(): boolean {
    return this.currentStopFn !== null;
  }

  public playAlarmSound(sound: AlarmSoundId, volume: number = 0.8): () => void {
    this.stopAlarm();
    this.unlock();
    const ctx = this.getContext();
    let isCancelled = false;
    let timerId: number | null = null;

    const stop = () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const runPattern = () => {
      if (isCancelled) return;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.05, Math.min(volume, 1.0)), ctx.currentTime);
      masterGain.connect(ctx.destination);

      const now = ctx.currentTime;

      switch (sound) {
        case 'cosmic-beacon': {
          // Dual frequency beacon pulse: 587Hz (D5) and 880Hz (A5)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const env = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(587.33, now);
          osc2.frequency.setValueAtTime(880, now);

          env.gain.setValueAtTime(0, now);
          env.gain.linearRampToValueAtTime(0.7, now + 0.05);
          env.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc1.connect(env);
          osc2.connect(env);
          env.connect(masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.65);
          osc2.stop(now + 0.65);

          // Second echo beep
          const osc3 = ctx.createOscillator();
          const env2 = ctx.createGain();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(1174.66, now + 0.3);
          env2.gain.setValueAtTime(0, now + 0.3);
          env2.gain.linearRampToValueAtTime(0.4, now + 0.35);
          env2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          osc3.connect(env2);
          env2.connect(masterGain);
          osc3.start(now + 0.3);
          osc3.stop(now + 0.75);

          timerId = window.setTimeout(runPattern, 1100);
          break;
        }

        case 'nebula-pulse': {
          // Sci-fi arpeggio sequence: C5 -> E5 -> G5 -> B5 -> C6
          const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            // Low-pass filter for smooth cosmic synth feel
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1600, now);

            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.38);
          });

          timerId = window.setTimeout(runPattern, 1200);
          break;
        }

        case 'quantum-chime': {
          // Ethereal crystal bells with high harmonics
          const bellPitches = [880, 1318.51, 1760];
          bellPitches.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);
            gain.gain.setValueAtTime(0, now + idx * 0.15);
            gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.15 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 1.2);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 1.3);
          });

          timerId = window.setTimeout(runPattern, 1800);
          break;
        }

        case 'starlight-radar': {
          // Sonar space radar blip with pitch drop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

          gain.gain.setValueAtTime(0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.55);

          timerId = window.setTimeout(runPattern, 900);
          break;
        }

        case 'pulsar-alarm':
        default: {
          // Urgent rhythmic pulsing alarm (college dorm wake-up guaranteed!)
          [0, 0.18, 0.36, 0.54].forEach((t) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now + t);
            osc.frequency.linearRampToValueAtTime(1050, now + t + 0.1);

            gain.gain.setValueAtTime(0, now + t);
            gain.gain.linearRampToValueAtTime(0.3, now + t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.12);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + t);
            osc.stop(now + t + 0.14);
          });

          timerId = window.setTimeout(runPattern, 1100);
          break;
        }
      }
    };

    runPattern();
    this.currentStopFn = stop;
    return stop;
  }

  public previewSound(sound: AlarmSoundId, volume: number = 0.8, durationMs: number = 2400): void {
    this.stopAlarm();
    const stopFn = this.playAlarmSound(sound, volume);
    window.setTimeout(() => {
      stopFn();
      if (this.currentStopFn === stopFn) {
        this.currentStopFn = null;
      }
    }, durationMs);
  }

  public playCelebrationSound(): void {
    this.unlock();
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Ascending majestic fanfare: G4 -> C5 -> E5 -> G5 -> C6
    const chord = [392, 523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.35, now + i * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.3);
    });
  }

  public playFeedbackSound(type: 'correct' | 'wrong' | 'click' | 'timer-complete'): void {
    this.unlock();
    const ctx = this.getContext();
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'correct') {
      // Pleasant double chime: 659Hz (E5) -> 880Hz (A5)
      [659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.45);
      });
    } else if (type === 'wrong') {
      // Gentle sci-fi buzz rejection
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'timer-complete') {
      // Triple gentle chime
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.2);
        gain.gain.setValueAtTime(0, now + i * 0.2);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.2 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.85);
      });
    }
  }
}

export const cosmicAudio = new CosmicAudioEngine();
