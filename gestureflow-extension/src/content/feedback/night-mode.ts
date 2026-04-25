export class NightModeController {
  private overlay: HTMLDivElement | null = null;
  private isEnabled = false;
  private opacity = 0.3;
  private autoStartTime: { hour: number; minute: number } | null = null;

  enable(opacity: number = 0.3): void {
    this.opacity = opacity;
    this.isEnabled = true;
    this.applyOverlay();
  }

  disable(): void {
    this.isEnabled = false;
    this.removeOverlay();
  }

  setOpacity(opacity: number): void {
    this.opacity = Math.max(0.1, Math.min(0.6, opacity));
    if (this.isEnabled && this.overlay) {
      this.overlay.style.backgroundColor = `rgba(10, 15, 30, ${this.opacity})`;
    }
  }

  setAutoStart(enabled: boolean, startTime?: { hour: number; minute: number }): void {
    if (enabled && startTime) {
      this.autoStartTime = startTime;
      this.checkAutoStart();
    } else {
      this.autoStartTime = null;
    }
  }

  private applyOverlay(): void {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'gestureflow-night-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(10, 15, 30, ${this.opacity});
      pointer-events: none;
      z-index: 2147483646;
      transition: background-color 0.5s ease;
    `;
    document.body.appendChild(this.overlay);
  }

  private removeOverlay(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
  }

  private checkAutoStart(): void {
    if (!this.autoStartTime) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = this.autoStartTime.hour * 60 + this.autoStartTime.minute;

    if (currentMinutes >= startMinutes && !this.isEnabled) {
      this.enable();
    } else if (currentMinutes < startMinutes && this.isEnabled) {
      this.disable();
    }

    setTimeout(() => this.checkAutoStart(), 60000);
  }

  getIsEnabled(): boolean {
    return this.isEnabled;
  }

  getOpacity(): number {
    return this.opacity;
  }

  destroy(): void {
    this.removeOverlay();
    this.autoStartTime = null;
  }
}
