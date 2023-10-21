import {
  App,
  BlockAction,
  BotMessageEvent,
  LogLevel,
  subtype,
} from '@slack/bolt';
import dotenv from 'dotenv';

import { pdListOncalls, pdPageSomeone } from './features/pagerduty';

dotenv.config();

const app = new App({
  signingSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
  socketMode: true,
});

app.use(async ({ next }) => {
  await next();
});

// pagerduty
// app.message('oncall', ({ message, say }) =>
//   pdOncallMessage({ message, say }, app),
// );
app.action<BlockAction>(
  { action_id: 'oncall-description', block_id: 'oncall-description' },
  pdPageSomeone,
);

// This will match any message that contains 👋
app.message(':wave:', async ({ message, say }) => {
  if (message.subtype === undefined || message.subtype === 'bot_message') {
    await say(`Hello, <@${message.user}>`);
  }
});

app.event('app_mention', async ({ event, say }) => {
  // determine command from text
  const text = event.text;
  const command = text.split(' ')[1];

  // handle commands
  switch (command) {
    case 'help':
      await say(`I can help you with the following commands:
\`help\` - show this message
\`oncall\` - page the on-call engineer
`);
      break;
    case 'oncall':
      await pdListOncalls({ message: event, say }, app);
      break;
    case undefined:
      await say(`:pleading_face: can i help u <@${event.user}>?`);
      await say(`try these :point_down: commands:
\`@penny help\` - show this message
\`@penny oncall\` - page the on-call engineer
`);
      break;
    default:
      await say(
        `Sorry, I don't understand that command. Try \`help\` for more information.`,
      );
      break;
  }
});

app.message(subtype('bot_message'), async ({ message, logger }) => {
  const botMessage = message as BotMessageEvent;
  logger.info(`The bot user ${botMessage.user} said ${botMessage.text}`);
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
