import { GameState } from './state.js';

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.noiseBuffer = null;

    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.init();
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
      window.addEventListener('touchend', unlock, { once: true, passive: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  init() {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this._createNoiseBuffer();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Ignore AudioContext restrictions prior to user gesture.
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  _ready() {
    if (this.muted) return false;
    const ctx = this.init();
    return Boolean(ctx);
  }

  _createNoiseBuffer() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * 0.5);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  _playYip(startTime, basePitch = 1.0, volume = 0.24) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    sub.type = 'triangle';

    const f0 = 370 * basePitch;
    const fPeak = 720 * basePitch;
    const fEnd = 430 * basePitch;

    osc.frequency.setValueAtTime(f0, startTime);
    osc.frequency.exponentialRampToValueAtTime(fPeak, startTime + 0.045);
    osc.frequency.exponentialRampToValueAtTime(fEnd, startTime + 0.11);

    sub.frequency.setValueAtTime(f0 * 0.5, startTime);
    sub.frequency.exponentialRampToValueAtTime(fPeak * 0.5, startTime + 0.045);
    sub.frequency.exponentialRampToValueAtTime(fEnd * 0.5, startTime + 0.11);

    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.5, startTime);
    filter.frequency.setValueAtTime(900 * basePitch, startTime);
    filter.frequency.exponentialRampToValueAtTime(2100 * basePitch, startTime + 0.05);
    filter.frequency.exponentialRampToValueAtTime(1000 * basePitch, startTime + 0.11);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.115);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    sub.start(startTime);
    osc.stop(startTime + 0.12);
    sub.stop(startTime + 0.12);
  }

  meow(pitch = 1.0) {
    if (!this._ready()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const p = Math.max(0.6, Math.min(1.6, pitch));

    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(520 * p, now);
    o.frequency.exponentialRampToValueAtTime(780 * p, now + 0.09);
    o.frequency.exponentialRampToValueAtTime(430 * p, now + 0.28);

    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.2, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.32);
  }

  bark(pitch = 1.0) {
    if (!this._ready()) return;
    if (GameState.theme === 'cat') {
      this.meow(pitch);
      return;
    }
    const now = this.ctx.currentTime;
    const clampedPitch = Math.max(0.5, Math.min(2.0, pitch));
    this._playYip(now, clampedPitch, 0.22);
    this._playYip(now + 0.14, clampedPitch * 1.09, 0.25);
  }

  bigBark() {
    if (!this._ready()) return;
    if (GameState.theme === 'cat') {
      this.meow(0.85);
      return;
    }
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const playWoof = (t, pitchMult, dur, vol) => {
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      sub.type = 'triangle';

      osc.frequency.setValueAtTime(130 * pitchMult, t);
      osc.frequency.exponentialRampToValueAtTime(215 * pitchMult, t + 0.055);
      osc.frequency.exponentialRampToValueAtTime(110 * pitchMult, t + dur);

      sub.frequency.setValueAtTime(65 * pitchMult, t);
      sub.frequency.exponentialRampToValueAtTime(108 * pitchMult, t + 0.055);
      sub.frequency.exponentialRampToValueAtTime(55 * pitchMult, t + dur);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4.0, t);
      filter.frequency.setValueAtTime(340, t);
      filter.frequency.exponentialRampToValueAtTime(880, t + 0.06);
      filter.frequency.exponentialRampToValueAtTime(260, t + dur);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      sub.start(t);
      osc.stop(t + dur + 0.01);
      sub.stop(t + dur + 0.01);
    };

    playWoof(now, 1.0, 0.19, 0.28);
    playWoof(now + 0.22, 1.06, 0.24, 0.3);
  }

  treatToss() {
    if (!this._ready()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2800, now + 0.16);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.001, now);
      nGain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.18);
    }
  }

  munch() {
    if (!this._ready()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.105;

      // Crunchy noise burst
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(2.2, t);
        filter.frequency.setValueAtTime(1100 + i * 220, t);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.001, t);
        nGain.gain.linearRampToValueAtTime(0.22, t + 0.01);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(ctx.destination);

        noise.start(t);
        noise.stop(t + 0.08);
      }

      // Warm woody bite pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startFreq = 220 + i * 35;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(95, t + 0.07);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  _playBellNote(freq, startTime, duration = 0.25, volume = 0.16, type = 'triangle') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const overGain = ctx.createGain();

    osc.type = type;
    overtone.type = 'sine';

    osc.frequency.setValueAtTime(freq, startTime);
    overtone.frequency.setValueAtTime(freq * 2, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    overGain.gain.setValueAtTime(0.001, startTime);
    overGain.gain.linearRampToValueAtTime(volume * 0.35, startTime + 0.008);
    overGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.65);

    osc.connect(gain);
    overtone.connect(overGain);
    gain.connect(ctx.destination);
    overGain.connect(ctx.destination);

    osc.start(startTime);
    overtone.start(startTime);
    osc.stop(startTime + duration + 0.01);
    overtone.stop(startTime + duration + 0.01);
  }

  zoomies() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;

    // Fast celebratory fanfare arpeggio (C5 - E5 - G5 - C6 - E6 - G6)
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    fanfare.forEach((freq, idx) => {
      this._playBellNote(freq, now + idx * 0.055, 0.24, 0.16, 'triangle');
    });

    // High sparkle chimes
    const sparkles = [1760, 2093, 2349.32, 2637.02, 3135.96];
    sparkles.forEach((freq, idx) => {
      this._playBellNote(freq, now + 0.25 + idx * 0.045, 0.2, 0.09, 'sine');
    });

    // Excited high puppy yip
    this._playYip(now + 0.36, 1.28, 0.18);
  }

  correct() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    const triad = [523.25, 659.25, 783.99, 1046.5];
    triad.forEach((freq, idx) => {
      this._playBellNote(freq, now + idx * 0.055, 0.32, 0.18, 'triangle');
    });
  }

  carryChime() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    // Magical rising Lydian sparkle when carrying 1 ten over to the tens column
    const scale = [587.33, 659.25, 783.99, 880.0, 987.77, 1174.66, 1567.98];
    scale.forEach((freq, idx) => {
      this._playBellNote(freq, now + idx * 0.04, 0.26, 0.13, 'sine');
    });
  }

  chimeNote(noteIndex = 0, duration = 0.3) {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    // Bright C-major scale pitches from C5 to E6 for distinct number chimes
    const scale = [
      523.25, // C5
      587.33, // D5
      659.25, // E5
      698.46, // F5
      783.99, // G5
      880.0,  // A5
      987.77, // B5
      1046.5, // C6
      1174.66, // D6
      1318.51, // E6
    ];
    const idx = Math.abs(Math.round(noteIndex)) % scale.length;
    const freq = scale[idx];
    this._playBellNote(freq, now, duration, 0.22, 'triangle');
    this._playBellNote(freq * 0.5, now, duration * 0.8, 0.1, 'sine');
  }

  oops() {
    if (!this._ready()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Gentle, soft non-punishing cartoon boing / puppy head-tilt
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.11);
    osc.frequency.exponentialRampToValueAtTime(265, now + 0.19);
    osc.frequency.exponentialRampToValueAtTime(195, now + 0.32);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  step() {
    if (!this._ready()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.5, now);
      filter.frequency.setValueAtTime(650, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.045);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.035);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  levelComplete() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;

    // Joyful victory jingle
    const melody = [
      { f: 523.25, t: 0.0, d: 0.14 },  // C5
      { f: 659.25, t: 0.11, d: 0.14 }, // E5
      { f: 783.99, t: 0.22, d: 0.14 }, // G5
      { f: 1046.5, t: 0.33, d: 0.26 }, // C6
      { f: 880.0, t: 0.56, d: 0.15 },  // A5
      { f: 1046.5, t: 0.70, d: 0.45 }, // C6
    ];

    melody.forEach((n) => {
      this._playBellNote(n.f, now + n.t, n.d, 0.18, 'triangle');
      this._playBellNote(n.f * 0.5, now + n.t, n.d, 0.09, 'sine');
    });

    // Happy celebratory puppy barks at the end
    this._playYip(now + 0.92, 1.05, 0.2);
    this._playYip(now + 1.06, 1.18, 0.22);
  }
}

export const SoundFX = new AudioEngine();
export default SoundFX;
