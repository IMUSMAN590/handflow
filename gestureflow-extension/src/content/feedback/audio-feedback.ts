import { GestureType } from '../../shared/types/gesture';

const SOUNDS_BASE_PATH = 'assets/sounds';

const GESTURE_SOUND_MAP: Record<string, string> = {
  [GestureType.SWIPE_LEFT]: 'whoosh.mp3',
  [GestureType.SWIPE_RIGHT]: 'whoosh.mp3',
  [GestureType.SWIPE_UP]: 'whoosh.mp3',
  [GestureType.SWIPE_DOWN]: 'whoosh.mp3',
  success: 'success.mp3',
  error: 'error.mp3',
};

const STATIC_GESTURE_SOUND = 'click.mp3';

const GESTURE_SPEECH_MAP: Record<string, string> = {
  [GestureType.SWIPE_LEFT]: 'Going back',
  [GestureType.SWIPE_RIGHT]: 'Going forward',
  [GestureType.SWIPE_UP]: 'Scrolling up',
  [GestureType.SWIPE_DOWN]: 'Scrolling down',
  [GestureType.OPEN_PALM]: 'Refreshing',
  [GestureType.FIST]: 'Closing tab',
  [GestureType.PEACE]: 'New tab',
  [GestureType.THUMBS_UP]: 'Bookmarked',
  thumbs_down: 'Bookmark removed',
  [GestureType.PINCH]: 'Zooming in',
  spread: 'Zooming out',
  wave: 'Toggling',
};

const SWIPE_TYPES = new Set([
  GestureType.SWIPE_LEFT,
  GestureType.SWIPE_RIGHT,
  GestureType.SWIPE_UP,
  GestureType.SWIPE_DOWN,
]);

function isSwipe(gestureType: string): boolean {
  return SWIPE_TYPES.has(gestureType as GestureType);
}

function resolveSoundUrl(filename: string): string {
  try {
    return chrome.runtime.getURL(`${SOUNDS_BASE_PATH}/${filename}`);
  } catch {
    return `${SOUNDS_BASE_PATH}/${filename}`;
  }
}

export class AudioFeedback {
  private audioContext: AudioContext | null = null;
  private soundCache = new Map<string, AudioBuffer>();
  private volume = 0.7;
  private speechVolume = 0.8;
  private speechRate = 1.0;
  private soundsEnabled = true;
  private speechEnabled = false;
  private preloaded = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  async init(): Promise<void> {
    if (this.preloaded) return;
    try {
      this.audioContext = new AudioContext();
      await this.preloadSounds();
      this.preloaded = true;
    } catch {
      this.audioContext = null;
    }
  }

  async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async playSound(soundFile: string): Promise<void> {
    if (!this.soundsEnabled) return;
    await this.ensureContext();

    const cached = this.soundCache.get(soundFile);
    if (cached && this.audioContext) {
      this.playBuffer(cached);
      return;
    }

    try {
      const url = resolveSoundUrl(soundFile);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (!this.audioContext) return;
      const buffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundCache.set(soundFile, buffer);
      this.playBuffer(buffer);
    } catch {
      this.playSyntheticFallback(soundFile);
    }
  }

  playGestureSound(gestureType: string): void {
    if (!this.soundsEnabled) return;

    let soundFile: string;
    if (GESTURE_SOUND_MAP[gestureType]) {
      soundFile = GESTURE_SOUND_MAP[gestureType];
    } else if (isSwipe(gestureType)) {
      soundFile = 'whoosh.mp3';
    } else {
      soundFile = STATIC_GESTURE_SOUND;
    }

    this.playSound(soundFile);
  }

  playSuccessSound(): void {
    this.playSound('success.mp3');
  }

  playErrorSound(): void {
    this.playSound('error.mp3');
  }

  speak(text: string): void {
    if (!this.speechEnabled) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.speechVolume;
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;
    this.currentUtterance = utterance;

    utterance.onend = () => { this.currentUtterance = null; };
    utterance.onerror = () => { this.currentUtterance = null; };

    window.speechSynthesis.speak(utterance);
  }

  speakGesture(gestureType: string): void {
    const text = GESTURE_SPEECH_MAP[gestureType];
    if (text) {
      this.speak(text);
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  setSpeechVolume(volume: number): void {
    this.speechVolume = Math.max(0, Math.min(1, volume));
  }

  getSpeechVolume(): number {
    return this.speechVolume;
  }

  setSpeechRate(rate: number): void {
    this.speechRate = Math.max(0.5, Math.min(2, rate));
  }

  getSpeechRate(): number {
    return this.speechRate;
  }

  enableSpeech(enabled: boolean): void {
    this.speechEnabled = enabled;
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeechEnabled(): boolean {
    return this.speechEnabled;
  }

  enableSounds(enabled: boolean): void {
    this.soundsEnabled = enabled;
  }

  isSoundsEnabled(): boolean {
    return this.soundsEnabled;
  }

  isSpeaking(): boolean {
    return this.currentUtterance !== null;
  }

  stopAll(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  destroy(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.soundCache.clear();
    this.preloaded = false;
  }

  private async ensureContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private playBuffer(buffer: AudioBuffer): void {
    if (!this.audioContext) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  private playSyntheticFallback(soundFile: string): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.value = this.volume * 0.4;
    gainNode.connect(ctx.destination);

    const oscillator = ctx.createOscillator();
    oscillator.connect(gainNode);

    if (soundFile.includes('whoosh')) {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      gainNode.gain.setValueAtTime(this.volume * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } else if (soundFile.includes('click')) {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(this.volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } else if (soundFile.includes('success')) {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523, now);
      oscillator.frequency.setValueAtTime(659, now + 0.1);
      oscillator.frequency.setValueAtTime(784, now + 0.2);
      gainNode.gain.setValueAtTime(this.volume * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      oscillator.start(now);
      oscillator.stop(now + 0.35);
    } else if (soundFile.includes('error')) {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2);
      gainNode.gain.setValueAtTime(this.volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      oscillator.start(now);
      oscillator.stop(now + 0.25);
    } else {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now);
      gainNode.gain.setValueAtTime(this.volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    }
  }

  private async preloadSounds(): Promise<void> {
    const files = ['whoosh.mp3', 'click.mp3', 'success.mp3', 'error.mp3'];
    await Promise.allSettled(
      files.map(async (file) => {
        try {
          const url = resolveSoundUrl(file);
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          if (this.audioContext) {
            const buffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.soundCache.set(file, buffer);
          }
        } catch {
          // Sound file not available; synthetic fallback will be used
        }
      }),
    );
  }
}
