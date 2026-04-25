export class VoiceGestureCombo {
  private recognition: unknown = null;
  private isListening = false;
  private lastTranscript = '';
  private lastGestureType: string | null = null;
  private comboTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly COMBO_WINDOW_MS = 2000;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      this.recognition = new (SpeechRecognitionClass as new () => unknown)();
      const rec = this.recognition as Record<string, unknown>;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: unknown) => {
        const e = event as { results: Array<{ isFinal: boolean; 0: { transcript: string } }> };
        const last = e.results[e.results.length - 1];
        if (last.isFinal) {
          this.lastTranscript = last[0].transcript.trim().toLowerCase();
          this.checkCombo();
        }
      };

      rec.onerror = () => {
        this.isListening = false;
      };

      rec.onend = () => {
        if (this.isListening) {
          try {
            (rec.start as () => void)();
          } catch {
            this.isListening = false;
          }
        }
      };
    } catch {
      this.recognition = null;
    }
  }

  startListening(): void {
    if (!this.recognition || this.isListening) return;
    try {
      ((this.recognition as Record<string, unknown>).start as () => void)();
      this.isListening = true;
    } catch {
      // already started
    }
  }

  stopListening(): void {
    if (!this.recognition) return;
    this.isListening = false;
    try {
      ((this.recognition as Record<string, unknown>).stop as () => void)();
    } catch {
      // already stopped
    }
  }

  setGesture(gestureType: string): void {
    this.lastGestureType = gestureType;
    this.checkCombo();

    if (this.comboTimeout) clearTimeout(this.comboTimeout);
    this.comboTimeout = setTimeout(() => {
      this.lastGestureType = null;
      this.lastTranscript = '';
    }, this.COMBO_WINDOW_MS);
  }

  private checkCombo(): void {
    if (!this.lastGestureType || !this.lastTranscript) return;
    this.lastGestureType = null;
    this.lastTranscript = '';
    if (this.comboTimeout) clearTimeout(this.comboTimeout);
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getLastTranscript(): string {
    return this.lastTranscript;
  }

  destroy(): void {
    this.stopListening();
    this.recognition = null;
  }
}
