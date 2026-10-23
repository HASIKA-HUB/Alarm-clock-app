/**
 * Web Audio API Cosmic Sound Synthesizer
 * Generates rich space-themed alarms and chimes purely in-browser with zero external audio files.
 */
import { AlarmSoundType } from '../types/alarmclock';

let audioCtx: AudioContext | null = null;
let currentLoopTimeout: number | null = null;
let activeLoopNodes: (AudioNode | { stop: () => void })[] = [];
let isLoopPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioUnlocked(): boolean {
  return !!audioCtx && audioCtx.state === 'running';
}

export async function unlockAudioContext(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Play a tiny silent buffer to warm up the audio engine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
    return true;
  } catch (e) {
    console.warn('Audio unlock warning:', e);
    return false;
  }
}

/**
 * Play a specific sound profile once
 */
function playSoundProfile(type: AlarmSoundType, volume = 0.7, ctx: AudioContext) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(volume, 1.0)), ctx.currentTime);
  masterGain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'cosmic_chime': {
      // Shimmering celestial chimes (pentatonic chords with shimmering decays)
      const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.3 / (idx + 1), now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
      break;
    }

    case 'pulsar_pulse': {
      // Rhythmic pulsing synth with lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.8);
      filter.connect(masterGain);

      for (let p = 0; p < 3; p++) {
        const offset = p * 0.28;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const pulseGain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(220, now + offset);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(440, now + offset);

        pulseGain.gain.setValueAtTime(0.001, now + offset);
        pulseGain.gain.linearRampToValueAtTime(0.4, now + offset + 0.05);
        pulseGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.24);

        osc1.connect(pulseGain);
        osc2.connect(pulseGain);
        pulseGain.connect(filter);

        osc1.start(now + offset);
        osc2.start(now + offset);
        osc1.stop(now + offset + 0.25);
        osc2.stop(now + offset + 0.25);
      }
      break;
    }

    case 'nebula_melody': {
      // Ethereal ascending space arpeggio with vibrato
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
      notes.forEach((note, index) => {
        const offset = index * 0.18;
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const noteGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now + offset);

        // Subtle vibrato
        lfo.frequency.setValueAtTime(6, now + offset);
        lfoGain.gain.setValueAtTime(4, now + offset);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        noteGain.gain.setValueAtTime(0.0001, now + offset);
        noteGain.gain.linearRampToValueAtTime(0.35, now + offset + 0.06);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.9);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        lfo.start(now + offset);
        osc.start(now + offset);
        lfo.stop(now + offset + 0.95);
        osc.stop(now + offset + 0.95);
      });
      break;
    }

    case 'supernova_alert': {
      // Energetic space wake-up fanfare
      const triads = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      triads.forEach((freq, idx) => {
        const offset = idx * 0.14;
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + offset);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.38, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + offset);
        osc.stop(now + offset + 0.38);
      });
      break;
    }

    case 'starlight_beacon': {
      // Warm celestial bell / deep space radar ping
      const osc = ctx.createOscillator();
      const oscSub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(493.88, now + 0.8); // B4

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(246.94, now); // B3

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      oscSub.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      oscSub.start(now);
      osc.stop(now + 1.3);
      oscSub.stop(now + 1.3);
      break;
    }
  }
}

/**
 * Starts continuous looping alarm until explicitly stopped
 */
export function playAlarmLoop(type: AlarmSoundType, volume = 0.85): void {
  stopAlarmLoop();
  const ctx = getAudioContext();
  isLoopPlaying = true;

  const loopInterval = 1800; // repeat every 1.8 seconds

  const tick = () => {
    if (!isLoopPlaying) return;
    try {
      playSoundProfile(type, volume, ctx);
    } catch (err) {
      console.warn('Alarm tick error:', err);
    }
    currentLoopTimeout = window.setTimeout(tick, loopInterval);
  };

  tick();
}

/**
 * Stops any actively ringing alarm
 */
export function stopAlarmLoop(): void {
  isLoopPlaying = false;
  if (currentLoopTimeout !== null) {
    clearTimeout(currentLoopTimeout);
    currentLoopTimeout = null;
  }
  activeLoopNodes = [];
}

/**
 * Plays a single preview of a sound
 */
export function previewSound(type: AlarmSoundType, volume = 0.75): void {
  const ctx = getAudioContext();
  playSoundProfile(type, volume, ctx);
}

/**
 * Celebratory starry chime when earning a star or badge
 */
export function playCelebrationChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 to G6
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.connect(ctx.destination);

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  } catch (e) {
    console.warn('Celebration chime error:', e);
  }
}
