import {
  AckFn,
  AppMentionEvent,
  BlockAction,
  BlockElementAction,
  KnownEventFromType,
  Logger,
  SayFn,
} from '@slack/bolt';
import { WebClient } from '@slack/web-api';

export interface BotMessage {
  message: KnownEventFromType<'message'> | AppMentionEvent;
  say: SayFn;
}

export interface BotAction {
  body: BlockAction<BlockElementAction>;
  client: WebClient;
  ack: AckFn<void>;
  logger: Logger;
}
