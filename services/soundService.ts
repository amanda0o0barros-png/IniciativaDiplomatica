
export const SOUNDS = {
  MEOW: 'https://actions.google.com/sounds/v1/animals/cat_meow.ogg',
  PURR: 'https://actions.google.com/sounds/v1/animals/cat_purr.ogg',
  LEVEL_UP: 'https://actions.google.com/sounds/v1/cartoon/conga_drum_accent.ogg',
  SUCCESS: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
  TIMER_END: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
};

class SoundService {
  private muted: boolean = false;

  setMuted(val: boolean) {
    this.muted = val;
  }

  isMuted() {
    return this.muted;
  }

  private play(url: string, volume: number = 0.4) {
    if (this.muted) return;
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(() => {
        // Ignore autoplay blocks
      });
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  playMeow() { this.play(SOUNDS.MEOW); }
  playPurr() { this.play(SOUNDS.PURR); }
  playLevelUp() { this.play(SOUNDS.LEVEL_UP, 0.6); }
  playSuccess() { this.play(SOUNDS.SUCCESS); }
  playTimerEnd() { this.play(SOUNDS.TIMER_END); }
}

export const soundService = new SoundService();
