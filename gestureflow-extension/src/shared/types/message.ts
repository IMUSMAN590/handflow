export enum MessageType {
  TOGGLE = 'TOGGLE',
  GESTURE_RECOGNIZED = 'GESTURE_RECOGNIZED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  PROFILE_SWITCHED = 'PROFILE_SWITCHED',
  RECORD_GESTURE = 'RECORD_GESTURE',
  EXECUTE_ACTION = 'EXECUTE_ACTION',
  GET_STATE = 'GET_STATE',
  STATE_RESPONSE = 'STATE_RESPONSE',
  ANALYTICS_UPDATE = 'ANALYTICS_UPDATE',
  MACRO_EXECUTE = 'MACRO_EXECUTE',
  ZONE_UPDATE = 'ZONE_UPDATE',
  CONTEXT_UPDATE = 'CONTEXT_UPDATE',
}

export interface Message<T = unknown> {
  type: MessageType;
  payload: T;
  timestamp: number;
}

export interface TogglePayload {
  isEnabled: boolean;
}

export interface GestureRecognizedPayload {
  gestureId: string;
  confidence: number;
  zone?: string;
}

export interface SettingsUpdatedPayload {
  settings: Record<string, unknown>;
}

export interface ProfileSwitchedPayload {
  profileId: string;
}

export interface RecordGesturePayload {
  gestureId: string;
  samples: unknown[];
}

export interface ExecuteActionPayload {
  actionType: string;
  actionValue: string;
}

export interface StatePayload {
  isEnabled: boolean;
  activeProfileId: string;
  cameraActive: boolean;
}

export interface AnalyticsUpdatePayload {
  gestureId: string;
  confidence: number;
  responseTime: number;
  isCorrect: boolean;
}

export interface MacroExecutePayload {
  macroId: string;
  steps: ExecuteActionPayload[];
}

export interface ZoneUpdatePayload {
  zone: string;
  active: boolean;
}

export interface ContextUpdatePayload {
  url: string;
  profileId?: string;
}
