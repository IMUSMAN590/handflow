import type { Settings } from '../../shared/types/settings';

const NAMESPACE = 'gf-feedback';

const PALETTE = {
  primary: '#0ea5e9',
  primaryLight: '#38bdf8',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  bgDark: 'rgba(15, 23, 42, 0.92)',
  bgMedium: 'rgba(30, 41, 59, 0.88)',
  trail: '#0ea5e9',
  zone: 'rgba(14, 165, 233, 0.15)',
  zoneBorder: 'rgba(14, 165, 233, 0.5)',
};

const NIGHT_PALETTE = {
  primary: '#64748b',
  primaryLight: '#94a3b8',
  success: '#4ade80',
  error: '#f87171',
  warning: '#fbbf24',
  text: '#cbd5e1',
  textMuted: '#64748b',
  bgDark: 'rgba(2, 6, 23, 0.92)',
  bgMedium: 'rgba(15, 23, 42, 0.88)',
  trail: '#64748b',
  zone: 'rgba(100, 116, 139, 0.12)',
  zoneBorder: 'rgba(100, 116, 139, 0.4)',
};

const DEFAULT_DURATION = 2000;
const TRAIL_MAX_POINTS = 60;

function palette(nightMode: boolean) {
  return nightMode ? NIGHT_PALETTE : PALETTE;
}

function injectStyles(doc: Document): HTMLStyleElement {
  const id = `${NAMESPACE}-styles`;
  let el = doc.getElementById(id) as HTMLStyleElement | null;
  if (el) return el;

  el = doc.createElement('style');
  el.id = id;
  el.textContent = `
    @keyframes ${NAMESPACE}-fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ${NAMESPACE}-fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-8px); }
    }
    @keyframes ${NAMESPACE}-flashSuccess {
      0% { opacity: 0.35; }
      100% { opacity: 0; }
    }
    @keyframes ${NAMESPACE}-flashError {
      0% { opacity: 0.35; }
      100% { opacity: 0; }
    }
    @keyframes ${NAMESPACE}-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    @keyframes ${NAMESPACE}-confidenceFill {
      from { width: 0; }
    }
    .${NAMESPACE}-root {
      position: fixed;
      z-index: 2147483646;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .${NAMESPACE}-gesture-name {
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 22px;
      border-radius: 12px;
      background: var(--gf-bg-dark);
      color: var(--gf-text);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.02em;
      box-shadow: 0 4px 24px rgba(0,0,0,0.35);
      animation: ${NAMESPACE}-fadeIn 0.2s ease-out;
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
    }
    .${NAMESPACE}-gesture-name.${NAMESPACE}-exiting {
      animation: ${NAMESPACE}-fadeOut 0.25s ease-in forwards;
    }
    .${NAMESPACE}-confidence-bar {
      width: 80px;
      height: 5px;
      border-radius: 3px;
      background: rgba(255,255,255,0.12);
      overflow: hidden;
    }
    .${NAMESPACE}-confidence-fill {
      height: 100%;
      border-radius: 3px;
      background: var(--gf-primary);
      animation: ${NAMESPACE}-confidenceFill 0.3s ease-out;
    }
    .${NAMESPACE}-toast {
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 18px;
      border-radius: 8px;
      background: var(--gf-bg-medium);
      color: var(--gf-text);
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 2px 12px rgba(0,0,0,0.25);
      animation: ${NAMESPACE}-fadeIn 0.18s ease-out;
      white-space: nowrap;
    }
    .${NAMESPACE}-toast.${NAMESPACE}-exiting {
      animation: ${NAMESPACE}-fadeOut 0.2s ease-in forwards;
    }
    .${NAMESPACE}-indicator {
      top: 24px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid var(--gf-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gf-bg-dark);
      box-shadow: 0 2px 16px rgba(0,0,0,0.3);
      animation: ${NAMESPACE}-pulse 1.2s ease-in-out infinite;
    }
    .${NAMESPACE}-indicator-value {
      font-size: 11px;
      font-weight: 700;
      color: var(--gf-primary);
    }
    .${NAMESPACE}-trail-canvas {
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }
    .${NAMESPACE}-zone {
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: 2px solid var(--gf-zone-border);
      background: var(--gf-zone);
      transition: opacity 0.3s ease;
    }
    .${NAMESPACE}-flash {
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }
    .${NAMESPACE}-flash-success {
      background: var(--gf-success);
      animation: ${NAMESPACE}-flashSuccess 0.5s ease-out forwards;
    }
    .${NAMESPACE}-flash-error {
      background: var(--gf-error);
      animation: ${NAMESPACE}-flashError 0.5s ease-out forwards;
    }
    .${NAMESPACE}-drawing-canvas {
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }
  `;
  (doc.head || doc.documentElement).appendChild(el);
  return el;
}

function createRootElement(
  doc: Document,
  className: string,
  nightMode: boolean,
): HTMLDivElement {
  const p = palette(nightMode);
  const el = doc.createElement('div');
  el.className = `${NAMESPACE}-root ${className}`;
  el.style.setProperty('--gf-primary', p.primary);
  el.style.setProperty('--gf-primary-light', p.primaryLight);
  el.style.setProperty('--gf-success', p.success);
  el.style.setProperty('--gf-error', p.error);
  el.style.setProperty('--gf-warning', p.warning);
  el.style.setProperty('--gf-text', p.text);
  el.style.setProperty('--gf-text-muted', p.textMuted);
  el.style.setProperty('--gf-bg-dark', p.bgDark);
  el.style.setProperty('--gf-bg-medium', p.bgMedium);
  el.style.setProperty('--gf-trail', p.trail);
  el.style.setProperty('--gf-zone', p.zone);
  el.style.setProperty('--gf-zone-border', p.zoneBorder);
  return el;
}

function dismissAfter(
  el: HTMLElement,
  ms: number,
  onRemove?: () => void,
): void {
  setTimeout(() => {
    el.classList.add(`${NAMESPACE}-exiting`);
    el.addEventListener('animationend', () => {
      el.remove();
      onRemove?.();
    }, { once: true });
  }, ms);
}

export class VisualFeedback {
  private doc: Document;
  private nightMode = false;
  private gestureNameEl: HTMLDivElement | null = null;
  private toastEl: HTMLDivElement | null = null;
  private indicatorEl: HTMLDivElement | null = null;
  private trailCanvas: HTMLCanvasElement | null = null;
  private trailCtx: CanvasRenderingContext2D | null = null;
  private zoneEl: HTMLDivElement | null = null;
  private drawingCanvas: HTMLCanvasElement | null = null;
  private drawingCtx: CanvasRenderingContext2D | null = null;
  private trailPoints: Array<{ x: number; y: number }> = [];
  private drawingPoints: Array<{ x: number; y: number }> = [];
  private gestureNameTimer: ReturnType<typeof setTimeout> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(doc?: Document) {
    this.doc = doc ?? document;
    injectStyles(this.doc);
  }

  configure(settings: Settings): void {
    this.nightMode = settings.nightMode;
    this.refreshColors();
  }

  setNightMode(enabled: boolean): void {
    this.nightMode = enabled;
    this.refreshColors();
  }

  showGestureName(name: string, confidence: number, duration = DEFAULT_DURATION): void {
    this.removeGestureName();

    const el = createRootElement(this.doc, `${NAMESPACE}-gesture-name`, this.nightMode);
    const label = this.doc.createElement('span');
    label.textContent = name;

    const bar = this.doc.createElement('div');
    bar.className = `${NAMESPACE}-confidence-bar`;
    const fill = this.doc.createElement('div');
    fill.className = `${NAMESPACE}-confidence-fill`;
    fill.style.width = `${Math.round(confidence * 100)}%`;
    bar.appendChild(fill);

    el.appendChild(label);
    el.appendChild(bar);
    this.doc.body.appendChild(el);
    this.gestureNameEl = el;

    if (this.gestureNameTimer) clearTimeout(this.gestureNameTimer);
    this.gestureNameTimer = setTimeout(() => this.removeGestureName(), duration);
  }

  showActionToast(message: string, duration = 1500): void {
    this.removeToast();

    const el = createRootElement(this.doc, `${NAMESPACE}-toast`, this.nightMode);
    el.textContent = message;
    this.doc.body.appendChild(el);
    this.toastEl = el;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.removeToast(), duration);
  }

  showConfidenceIndicator(confidence: number): void {
    if (!this.indicatorEl) {
      const el = createRootElement(this.doc, `${NAMESPACE}-indicator`, this.nightMode);
      const value = this.doc.createElement('span');
      value.className = `${NAMESPACE}-indicator-value`;
      el.appendChild(value);
      this.doc.body.appendChild(el);
      this.indicatorEl = el;
    }
    const valueEl = this.indicatorEl.querySelector(`.${NAMESPACE}-indicator-value`);
    if (valueEl) valueEl.textContent = `${Math.round(confidence * 100)}%`;
  }

  hideConfidenceIndicator(): void {
    this.indicatorEl?.remove();
    this.indicatorEl = null;
  }

  showTrailEffect(positions: Array<{ x: number; y: number }>): void {
    this.trailPoints = positions.slice(-TRAIL_MAX_POINTS);
    this.ensureTrailCanvas();
    this.renderTrail();
  }

  addTrailPoint(point: { x: number; y: number }): void {
    this.trailPoints.push(point);
    if (this.trailPoints.length > TRAIL_MAX_POINTS) {
      this.trailPoints.shift();
    }
    this.ensureTrailCanvas();
    this.renderTrail();
  }

  clearTrail(): void {
    this.trailPoints = [];
    if (this.trailCtx && this.trailCanvas) {
      this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
    }
  }

  showZoneHighlight(zone: string): void {
    this.hideZoneHighlight();

    const el = createRootElement(this.doc, `${NAMESPACE}-zone`, this.nightMode);
    el.dataset.zone = zone;
    this.doc.body.appendChild(el);
    this.zoneEl = el;
  }

  hideZoneHighlight(): void {
    this.zoneEl?.remove();
    this.zoneEl = null;
  }

  showSuccessFlash(): void {
    this.showFlash(`${NAMESPACE}-flash-success`);
  }

  showErrorFlash(): void {
    this.showFlash(`${NAMESPACE}-flash-error`);
  }

  showDrawingTrail(points: Array<{ x: number; y: number }>): void {
    this.drawingPoints = points;
    this.ensureDrawingCanvas();
    this.renderDrawing();
  }

  addDrawingPoint(point: { x: number; y: number }): void {
    this.drawingPoints.push(point);
    this.ensureDrawingCanvas();
    this.renderDrawing();
  }

  clearDrawingTrail(): void {
    this.drawingPoints = [];
    if (this.drawingCtx && this.drawingCanvas) {
      this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    }
  }

  clearAllFeedback(): void {
    this.removeGestureName();
    this.removeToast();
    this.hideConfidenceIndicator();
    this.clearTrail();
    this.hideZoneHighlight();
    this.clearDrawingTrail();

    const flashes = this.doc.querySelectorAll(`.${NAMESPACE}-flash`);
    flashes.forEach((f) => f.remove());

    if (this.trailCanvas) { this.trailCanvas.remove(); this.trailCanvas = null; this.trailCtx = null; }
    if (this.drawingCanvas) { this.drawingCanvas.remove(); this.drawingCanvas = null; this.drawingCtx = null; }
  }

  destroy(): void {
    this.clearAllFeedback();
    const styleEl = this.doc.getElementById(`${NAMESPACE}-styles`);
    if (styleEl) styleEl.remove();
  }

  private removeGestureName(): void {
    if (this.gestureNameTimer) { clearTimeout(this.gestureNameTimer); this.gestureNameTimer = null; }
    if (this.gestureNameEl) {
      dismissAfter(this.gestureNameEl, 0);
      this.gestureNameEl = null;
    }
  }

  private removeToast(): void {
    if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = null; }
    if (this.toastEl) {
      dismissAfter(this.toastEl, 0);
      this.toastEl = null;
    }
  }

  private showFlash(extraClass: string): void {
    const el = createRootElement(this.doc, `${NAMESPACE}-flash ${extraClass}`, this.nightMode);
    this.doc.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  private ensureTrailCanvas(): void {
    if (this.trailCanvas) return;
    const canvas = this.doc.createElement('canvas');
    canvas.className = `${NAMESPACE}-root ${NAMESPACE}-trail-canvas`;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.doc.body.appendChild(canvas);
    this.trailCanvas = canvas;
    this.trailCtx = canvas.getContext('2d');
  }

  private ensureDrawingCanvas(): void {
    if (this.drawingCanvas) return;
    const canvas = this.doc.createElement('canvas');
    canvas.className = `${NAMESPACE}-root ${NAMESPACE}-drawing-canvas`;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.doc.body.appendChild(canvas);
    this.drawingCanvas = canvas;
    this.drawingCtx = canvas.getContext('2d');
  }

  private renderTrail(): void {
    if (!this.trailCtx || !this.trailCanvas) return;
    const ctx = this.trailCtx;
    const p = palette(this.nightMode);
    ctx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);

    if (this.trailPoints.length < 2) return;

    for (let i = 1; i < this.trailPoints.length; i++) {
      const alpha = i / this.trailPoints.length;
      ctx.beginPath();
      ctx.moveTo(this.trailPoints[i - 1].x, this.trailPoints[i - 1].y);
      ctx.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      ctx.strokeStyle = p.trail;
      ctx.globalAlpha = alpha * 0.7;
      ctx.lineWidth = 2 + alpha * 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private renderDrawing(): void {
    if (!this.drawingCtx || !this.drawingCanvas) return;
    const ctx = this.drawingCtx;
    const p = palette(this.nightMode);
    ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

    if (this.drawingPoints.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(this.drawingPoints[0].x, this.drawingPoints[0].y);
    for (let i = 1; i < this.drawingPoints.length; i++) {
      ctx.lineTo(this.drawingPoints[i].x, this.drawingPoints[i].y);
    }
    ctx.strokeStyle = p.primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;

    const last = this.drawingPoints[this.drawingPoints.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = p.primaryLight;
    ctx.fill();
  }

  private refreshColors(): void {
    const p = palette(this.nightMode);
    const rootVars: Array<[HTMLElement | null, Record<string, string>]> = [
      [this.gestureNameEl, {
        '--gf-bg-dark': p.bgDark, '--gf-text': p.text, '--gf-primary': p.primary,
      }],
      [this.toastEl, {
        '--gf-bg-medium': p.bgMedium, '--gf-text': p.text,
      }],
      [this.indicatorEl, {
        '--gf-bg-dark': p.bgDark, '--gf-primary': p.primary,
      }],
      [this.zoneEl, {
        '--gf-zone': p.zone, '--gf-zone-border': p.zoneBorder,
      }],
    ];

    for (const [el, vars] of rootVars) {
      if (!el) continue;
      for (const [key, val] of Object.entries(vars)) {
        el.style.setProperty(key, val);
      }
    }

    if (this.trailPoints.length > 0) this.renderTrail();
    if (this.drawingPoints.length > 0) this.renderDrawing();
  }
}
