import { WEBSITE_PACKS } from '../../shared/constants/websites';
import type { Gesture } from '../../shared/types/gesture';

interface WidgetGesture {
  id: string;
  name: string;
  icon: string;
  action: string;
}

export class GestureShortcutsWidget {
  private relevantGestures: WidgetGesture[] = [];
  private isVisible = false;
  private isLearningMode = false;

  updateContext(url: string, gestures: Gesture[]): void {
    this.relevantGestures = this.buildRelevantGestures(url, gestures);
  }

  private buildRelevantGestures(url: string, gestures: Gesture[]): WidgetGesture[] {
    const websitePack = this.matchWebsitePack(url);

    if (websitePack) {
      return websitePack.gestures
        .slice(0, 3)
        .map((g) => ({
          id: g.gestureId,
          name: g.gestureId.replace(/_/g, ' '),
          icon: this.getGestureIcon(g.gestureId),
          action: g.action.value,
        }));
    }

    return gestures
      .filter((g) => g.isEnabled)
      .slice(0, 3)
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: this.getGestureIcon(g.id),
        action: g.action.value,
      }));
  }

  private matchWebsitePack(url: string): { gestures: Array<{ gestureId: string; action: { type: string; value: string } }> } | null {
    for (const pack of Object.values(WEBSITE_PACKS)) {
      if (url.includes(pack.urlPattern)) {
        return pack;
      }
    }
    return null;
  }

  private getGestureIcon(gestureId: string): string {
    const iconMap: Record<string, string> = {
      'swipe-left': '←',
      'swipe-right': '→',
      'swipe-up': '↑',
      'swipe-down': '↓',
      'open-palm': '🖐',
      'fist': '✊',
      'peace': '✌️',
      'thumbs-up': '👍',
      'thumbs-down': '👎',
      'point': '☝️',
      'pinch': '🤏',
      'ok-sign': '👌',
      'wave': '👋',
      'rotate': '🔄',
      'rock': '🤘',
    };
    return iconMap[gestureId] ?? '✋';
  }

  getWidgetGestures(): WidgetGesture[] {
    return this.relevantGestures;
  }

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  getIsVisible(): boolean {
    return this.isVisible;
  }

  setLearningMode(enabled: boolean): void {
    this.isLearningMode = enabled;
  }

  getIsLearningMode(): boolean {
    return this.isLearningMode;
  }
}
