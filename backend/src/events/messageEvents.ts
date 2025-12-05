import { EventEmitter } from 'events';
import type { Message } from '@prisma/client';

// Simple event emitter so HTTP controllers can notify the WebSocket layer
class MessageEventEmitter extends EventEmitter {}

export const messageEvents = new MessageEventEmitter();

export const MESSAGE_CREATED_EVENT = 'message:created';

export type MessageCreatedPayload = Message;
