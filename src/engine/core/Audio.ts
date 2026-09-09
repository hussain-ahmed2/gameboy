/**
 * @file Audio.ts
 * @description Web Audio API wrapper for game sounds.
 *   Provides tone generation, noise, and volume control.
 */

export class Audio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;

  /** Initialize audio context (requires user gesture) */
  private ensureContext(): void {
    if (this.initialized) return;
    
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;
    this.initialized = true;
  }

  /** Resume audio context (call on first user interaction) */
  resume(): void {
    this.ensureContext();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /** Set master volume (0-1) */
  setMasterVolume(volume: number): void {
    this.ensureContext();
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /** Play a tone at given frequency */
  playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.3
  ): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    osc.start(now);
    osc.stop(now + duration);
  }

  /** Play noise burst */
  playNoise(duration: number, volume = 0.2): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();

    source.buffer = buffer;
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    source.start(now);
    source.stop(now + duration);
  }

  /** Play a quick beep (confirmation sound) */
  beep(): void {
    this.playTone(880, 0.1, 'square', 0.2);
  }

  /** Play a boop (lower pitch) */
  boop(): void {
    this.playTone(440, 0.1, 'sine', 0.2);
  }

  /** Play jump sound */
  jump(): void {
    this.playTone(660, 0.08, 'square', 0.25);
    setTimeout(() => this.playTone(880, 0.08, 'square', 0.15), 50);
  }

  /** Play coin collect sound */
  coin(): void {
    this.playTone(1000, 0.05, 'sine', 0.3);
    setTimeout(() => this.playTone(1320, 0.05, 'sine', 0.2), 30);
  }

  /** Play explosion sound */
  explosion(): void {
    this.playNoise(0.3, 0.3);
  }

  /** Clean up audio context */
  dispose(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
      this.initialized = false;
    }
  }
}