import type { GestureAction } from '../shared/types/gesture';
import { executeAction } from './action-executor';

export interface MacroStep {
  gestureId: string;
  action: GestureAction;
  delayMs: number;
}

export interface Macro {
  id: string;
  name: string;
  isEnabled: boolean;
  steps: MacroStep[];
  createdAt: number;
  timeWindowMs: number;
}

interface MacroProgress {
  macroId: string;
  currentStepIndex: number;
  lastStepTimestamp: number;
}

const STORAGE_KEY = 'gestureflow_macros';
const MAX_STEPS = 5;
const DEFAULT_TIME_WINDOW_MS = 3000;

let macros: Macro[] = [];
let activeProgress: MacroProgress | null = null;
let isRecording = false;
let recordingSteps: MacroStep[] = [];
let recordingStartTime = 0;

async function loadMacros(): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  macros = (result[STORAGE_KEY] as Macro[]) ?? [];
}

async function persistMacros(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: macros });
}

export function startMacroRecording(): void {
  isRecording = true;
  recordingSteps = [];
  recordingStartTime = Date.now();
}

export function recordGestureStep(gestureId: string, action: GestureAction): void {
  if (!isRecording) return;
  if (recordingSteps.length >= MAX_STEPS) return;

  const elapsed = Date.now() - recordingStartTime;
  const prevDelay = recordingSteps.length > 0
    ? elapsed - recordingSteps.reduce((sum, s) => sum + s.delayMs, 0)
    : 0;

  recordingSteps.push({
    gestureId,
    action,
    delayMs: recordingSteps.length === 0 ? 0 : Math.max(prevDelay, 100),
  });

  recordingStartTime = Date.now();
}

export function stopMacroRecording(): MacroStep[] {
  const steps = [...recordingSteps];
  isRecording = false;
  recordingSteps = [];
  recordingStartTime = 0;
  return steps;
}

export async function createMacro(
  id: string,
  name: string,
  steps: MacroStep[],
  timeWindowMs?: number,
): Promise<Macro> {
  await loadMacros();

  if (steps.length > MAX_STEPS) {
    throw new Error(`Macro cannot have more than ${MAX_STEPS} steps`);
  }

  if (macros.some((m) => m.id === id)) {
    throw new Error(`Macro already exists: ${id}`);
  }

  const macro: Macro = {
    id,
    name,
    isEnabled: true,
    steps,
    createdAt: Date.now(),
    timeWindowMs: timeWindowMs ?? DEFAULT_TIME_WINDOW_MS,
  };

  macros.push(macro);
  await persistMacros();
  return macro;
}

export async function deleteMacro(macroId: string): Promise<void> {
  await loadMacros();
  macros = macros.filter((m) => m.id !== macroId);
  if (activeProgress?.macroId === macroId) {
    activeProgress = null;
  }
  await persistMacros();
}

export async function executeMacro(macroId: string): Promise<boolean> {
  await loadMacros();
  const macro = macros.find((m) => m.id === macroId && m.isEnabled);
  if (!macro) return false;

  for (const step of macro.steps) {
    if (step.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, step.delayMs));
    }
    const result = await executeAction(step.action);
    if (!result.success) return false;
  }

  return true;
}

export function checkMacroProgress(gestureId: string): {
  isMacroProgress: boolean;
  macroId: string | null;
  isComplete: boolean;
} {
  const enabledMacros = macros.filter((m) => m.isEnabled);

  if (!activeProgress) {
    for (const macro of enabledMacros) {
      if (macro.steps[0]?.gestureId === gestureId) {
        if (macro.steps.length === 1) {
          return { isMacroProgress: true, macroId: macro.id, isComplete: true };
        }
        activeProgress = {
          macroId: macro.id,
          currentStepIndex: 1,
          lastStepTimestamp: Date.now(),
        };
        return { isMacroProgress: true, macroId: macro.id, isComplete: false };
      }
    }
    return { isMacroProgress: false, macroId: null, isComplete: false };
  }

  const macro = enabledMacros.find((m) => m.id === activeProgress!.macroId);
  if (!macro) {
    activeProgress = null;
    return { isMacroProgress: false, macroId: null, isComplete: false };
  }

  const elapsed = Date.now() - activeProgress.lastStepTimestamp;
  if (elapsed > macro.timeWindowMs) {
    activeProgress = null;
    return checkMacroProgress(gestureId);
  }

  const expectedStep = macro.steps[activeProgress.currentStepIndex];
  if (!expectedStep || expectedStep.gestureId !== gestureId) {
    activeProgress = null;
    return { isMacroProgress: false, macroId: null, isComplete: false };
  }

  const nextIndex = activeProgress.currentStepIndex + 1;
  if (nextIndex >= macro.steps.length) {
    activeProgress = null;
    return { isMacroProgress: true, macroId: macro.id, isComplete: true };
  }

  activeProgress = {
    macroId: macro.id,
    currentStepIndex: nextIndex,
    lastStepTimestamp: Date.now(),
  };
  return { isMacroProgress: true, macroId: macro.id, isComplete: false };
}

export function resetMacroProgress(): void {
  activeProgress = null;
}

export async function getActiveMacros(): Promise<Macro[]> {
  await loadMacros();
  return macros.filter((m) => m.isEnabled);
}

export async function getAllMacros(): Promise<Macro[]> {
  await loadMacros();
  return [...macros];
}

export async function updateMacro(
  macroId: string,
  updates: Partial<Pick<Macro, 'name' | 'isEnabled' | 'steps' | 'timeWindowMs'>>,
): Promise<void> {
  await loadMacros();
  const idx = macros.findIndex((m) => m.id === macroId);
  if (idx === -1) throw new Error(`Macro not found: ${macroId}`);

  if (updates.steps && updates.steps.length > MAX_STEPS) {
    throw new Error(`Macro cannot have more than ${MAX_STEPS} steps`);
  }

  macros[idx] = { ...macros[idx], ...updates };
  await persistMacros();
}

export function getIsRecording(): boolean {
  return isRecording;
}

export function getRecordingSteps(): MacroStep[] {
  return [...recordingSteps];
}

export async function initMacroEngine(): Promise<void> {
  await loadMacros();
}
