import type { App, BlockAction } from '@slack/bolt';
import { PagerDutyService } from '../services/pagerduty';

export const setupBlockActions = (app: App) => {
  app.action<BlockAction>({ action_id: 'button-link' }, async ({ ack }) => {
    await ack();
  });

  app.action<BlockAction>(
    { action_id: 'button-cancel-delete-message' },
    async ({ body, ack, client }) => {
      await ack();
      if (body.channel && body.message) {
        await client.chat.delete({
          channel: body.channel.id,
          ts: body.message.ts,
        });
      }
    },
  );

  app.action<BlockAction>(
    { action_id: 'oncall-page' },
    async ({ ack, body, client }) => {
      await ack();
      const pdService = new PagerDutyService();
      await pdService.pageSomeone({ body, client });
    },
  );
};
