import type {
  AckFn,
  AppMentionEvent,
  BlockAction,
  KnownEventFromType,
  Logger,
  SayFn,
} from '@slack/bolt';
import type { WebClient } from '@slack/web-api';

export interface BotMessage {
  message: KnownEventFromType<'message'> | AppMentionEvent;
  say: SayFn;
}

export interface BotAction {
  body: BlockAction;
  client: WebClient;
  ack: AckFn<void>;
  logger: Logger;
}
