/**
 * @file Audio.ts
 * @description Web Audio API wrapper for game sounds.
 *   Provides tone generation, noise, and volume control.
 */

export class Audio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private isMuted = false;
  private savedVolume = 0.5;

  /** Initialize audio context (requires user gesture) */
  private ensureContext(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.isMuted ? 0 : this.savedVolume;
      this.initialized = true;
    } catch {
      // AudioContext unavailable
    }
  }

  /** Resume audio context (call on first user interaction) */
  resume(): void {
    this.ensureContext();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** Set master volume (0-1) */
  setMasterVolume(volume: number): void {
    this.ensureContext();
    this.savedVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = this.savedVolume;
    }
  }

  /** Toggle master mute */
  toggleMute(): boolean {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.savedVolume;
    }
    return this.isMuted;
  }

  /** Set mute state explicitly */
  setMuted(muted: boolean): void {
    this.ensureContext();
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.savedVolume;
    }
  }

  /** Get mute state */
  getMuted(): boolean {
    return this.isMuted;
  }

  /** Play tactile physical button click feedback */
  playClick(): void {
    if (typeof window === 'undefined' || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      if (this.ctx.state !== 'running') {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return;
      }

      // Micro pitch randomized variation (±4%) so rapid tapping sounds organic
      const pitchMod = 0.96 + Math.random() * 0.08;
      const now = this.ctx.currentTime;

      // Component 1: Crisp tactile membrane snap (triangle with sharp 12ms drop)
      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snap.type = 'triangle';
      snap.frequency.setValueAtTime(1950 * pitchMod, now);
      snap.frequency.exponentialRampToValueAtTime(340 * pitchMod, now + 0.012);

      snapGain.gain.setValueAtTime(0.18, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      snap.connect(snapGain);
      snapGain.connect(this.masterGain);

      snap.start(now);
      snap.stop(now + 0.015);

      // Component 2: Subtle low-frequency dome bottom-out thud (~140Hz)
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(155 * pitchMod, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.020);

      thudGain.gain.setValueAtTime(0.13, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      thud.connect(thudGain);
      thudGain.connect(this.masterGain);

      thud.start(now);
      thud.stop(now + 0.023);
    } catch {
      // AudioContext unavailable or autoplay policy restricted
    }
  }

  /** Play a tone at given frequency */
  playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.3
  ): void {
    if (typeof window === 'undefined' || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      if (this.ctx.state !== 'running') {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return;
      }

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
    } catch {
      // Ignore audio playback error if interrupted
    }
  }

  /** Play noise burst */
  playNoise(duration: number, volume = 0.2): void {
    if (typeof window === 'undefined' || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      if (this.ctx.state !== 'running') {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return;
      }

      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
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
    } catch {
      // Ignore audio playback error
    }
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