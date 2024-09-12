import { App, LogLevel } from '@slack/bolt';
import { commands } from './commands';
import { handleAppMention } from './handlers/appMention';
import { handleSlashCommand } from './handlers/slashCommand';
import { setupBlockActions } from './handlers/blockActions';
import { loadEnv } from './utils/env';
import { findCommand } from './utils/commands';

(async () => {
  try {
    loadEnv();

    const app = new App({
      signingSecret: process.env.SLACK_CLIENT_SIGNING_SECRET!,
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      logLevel: LogLevel.INFO,
      socketMode: true,
      customRoutes: [
        {
          path: '/healthz',
          method: ['GET'],
          handler: (_req, res) => {
            res.writeHead(200);
            res.end('ok');
          },
        },
      ],
    });

    app.use(async ({ next }) => {
      await next();
    });

    app.command('/rosie', async ({ ack, respond, context }) => {
      await ack();
      const { user } = await app.client.users.info({ user: context.userId! });
      if (!user) {
        await respond({
          text: 'You must be in a channel to use this command.',
        });
        return;
      }

      const command = findCommand(context.command);
      if (!command) {
        await respond({
          text: 'Command not found.',
        });
        return;
      }


    });


    setupBlockActions(app);

    try {
      await app.start();
      console.log(`⚡️ Bolt app is running!`);
    } catch (error) {
      console.error('Failed to start app:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
})();
