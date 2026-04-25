import type { GestureType } from '../../shared/types/gesture';

export interface PasswordStep {
  gestureType: GestureType;
  maxDelayMs: number;
}

export interface GesturePassword {
  id: string;
  name: string;
  steps: PasswordStep[];
  action: { type: string; value: string };
  isEnabled: boolean;
}

interface PasswordProgress {
  currentStep: number;
  lastMatchTime: number;
  isComplete: boolean;
}

const STEP_TIMEOUT_MS = 3000;

export class GesturePasswordEngine {
  private passwords: GesturePassword[] = [];
  private activeProgress: Map<string, PasswordProgress> = new Map();

  addPassword(password: GesturePassword): void {
    this.passwords.push(password);
    this.activeProgress.set(password.id, {
      currentStep: 0,
      lastMatchTime: 0,
      isComplete: false,
    });
  }

  removePassword(id: string): void {
    this.passwords = this.passwords.filter((p) => p.id !== id);
    this.activeProgress.delete(id);
  }

  getPasswords(): GesturePassword[] {
    return [...this.passwords];
  }

  checkGesture(gestureType: GestureType): GesturePassword | null {
    const now = Date.now();
    let matchedPassword: GesturePassword | null = null;

    for (const password of this.passwords) {
      if (!password.isEnabled) continue;

      const progress = this.activeProgress.get(password.id);
      if (!progress || progress.isComplete) continue;

      const currentStep = password.steps[progress.currentStep];
      if (!currentStep) continue;

      if (progress.currentStep > 0) {
        const elapsed = now - progress.lastMatchTime;
        if (elapsed > currentStep.maxDelayMs || elapsed > STEP_TIMEOUT_MS) {
          progress.currentStep = 0;
        }
      }

      if (gestureType === currentStep.gestureType) {
        progress.currentStep++;
        progress.lastMatchTime = now;

        if (progress.currentStep >= password.steps.length) {
          progress.isComplete = true;
          matchedPassword = password;
          progress.currentStep = 0;
          progress.isComplete = false;
        }
      } else {
        progress.currentStep = 0;
      }
    }

    return matchedPassword;
  }

  getProgress(passwordId: string): PasswordProgress | undefined {
    return this.activeProgress.get(passwordId);
  }

  resetProgress(passwordId: string): void {
    this.activeProgress.set(passwordId, {
      currentStep: 0,
      lastMatchTime: 0,
      isComplete: false,
    });
  }

  resetAll(): void {
    for (const id of this.activeProgress.keys()) {
      this.resetProgress(id);
    }
  }

  loadPasswords(passwords: GesturePassword[]): void {
    this.passwords = passwords;
    this.activeProgress.clear();
    for (const p of passwords) {
      this.activeProgress.set(p.id, {
        currentStep: 0,
        lastMatchTime: 0,
        isComplete: false,
      });
    }
  }
}
