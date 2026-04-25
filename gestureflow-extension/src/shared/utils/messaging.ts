import { MessageType } from '../types/message';
import type { Message } from '../types/message';

const VALID_MESSAGE_TYPES = new Set<string>(Object.values(MessageType));

function isValidMessage(msg: unknown): msg is Message {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.type === 'string' &&
    VALID_MESSAGE_TYPES.has(m.type) &&
    typeof m.timestamp === 'number'
  );
}

export function sendMessage<T>(type: MessageType, payload: T): Promise<void> {
  const message: Message<T> = {
    type,
    payload,
    timestamp: Date.now(),
  };
  return chrome.runtime.sendMessage(message);
}

export function onMessage<T>(
  type: MessageType,
  callback: (payload: T, message: Message<T>) => void,
): () => void {
  const listener = (message: unknown, _sender: chrome.runtime.MessageSender) => {
    if (!isValidMessage(message)) return;
    if (message.type === type) {
      callback(message.payload as T, message as Message<T>);
    }
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}

export async function sendMessageToTab<T>(
  tabId: number,
  type: MessageType,
  payload: T,
): Promise<void> {
  const message: Message<T> = {
    type,
    payload,
    timestamp: Date.now(),
  };
  await chrome.tabs.sendMessage(tabId, message);
}
