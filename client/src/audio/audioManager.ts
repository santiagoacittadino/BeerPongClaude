// Manages all game audio: asset sounds + procedurally generated SFX

class AudioManager {
  private ctx: AudioContext | null = null;
  private sounds = new Map<string, HTMLAudioElement>();

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  load(name: string, src: string): void {
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  play(name: string, volume = 1): void {
    const audio = this.sounds.get(name);
    if (!audio) return;
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = Math.max(0, Math.min(1, volume));
    clone.play().catch(() => {});
  }

  // Procedural retro bounce beep
  playBounce(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Retro game-start jingle
  playStart(): void {
    const ctx = this.getCtx();
    const notes = [330, 392, 494, 659];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      const t = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // Victory fanfare
  playVictory(): void {
    const ctx = this.getCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      const t = ctx.currentTime + i * 0.15;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }
}

export const audioManager = new AudioManager();

// Preload asset sounds
audioManager.load('goal-p1', '/assets/yeyeye.mp3');
audioManager.load('goal-p2', '/assets/beer-time.mp3');
