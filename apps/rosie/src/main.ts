import type { BlockAction } from '@slack/bolt';
import { App, LogLevel } from '@slack/bolt';
import { config } from 'dotenv';
import { distance } from 'fastest-levenshtein';
import { argoListApps } from './features/argo';
import { pdListOncalls, pdPageSomeone } from './features/oncall';

if (process.env.NODE_ENV === 'development') config();

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

interface CommandInfo {
  command: string;
  description: string;
  subCommands?: CommandInfo[];

  action?: (args: string[], event: any, say: any, app?: any) => void;
}

const commands: CommandInfo[] = [
  {
    command: 'argo',
    description: 'Interact with Argo',
    subCommands: [
      {
        command: 'applications',
        description: 'List Argo applications',
        action: async (args, event, say) => {
          await argoListApps({ message: event, say });
        },
      },
      {
        command: 'status',
        description: 'Get Argo status (optionally provide appname)',
        action: async (args, event, say) => {
          const appName = args[1];
          if (appName) {
            await say(`Fetching status for application: ${appName}`);
          } else {
            await say(`Fetching general Argo status.`);
          }
        },
      },
    ],
  },
  {
    command: 'help',
    description: 'Show this help message',
    action: async (args, event, say) => {
      await say(generateHelp(commands));
    },
  },
  {
    command: 'oncall',
    description: 'Page the on-call engineer',
    action: async (args, event, say, app) => {
      await pdListOncalls({ message: event, say }, app);
    },
  },
];

function generateHelpForCommand(cmd: CommandInfo, prefix = ''): string {
  let helpText = `\`${prefix}${cmd.command}\` - ${cmd.description}\n`;

  if (cmd.subCommands) {
    for (const subCmd of cmd.subCommands) {
      helpText += generateHelpForCommand(subCmd, `${prefix}${cmd.command} `);
    }
  }

  return helpText;
}

function generateHelp(commands: CommandInfo[]): string {
  let helpText = 'I can help you with the following commands:\n';
  for (const cmd of commands) {
    helpText += generateHelpForCommand(cmd);
  }
  return helpText;
}

// pagerduty
app.action<BlockAction>(
  { action_id: 'oncall-page', block_id: 'oncall-actions' },
  pdPageSomeone,
);

// all block actions need to be responded to
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

const DISTANCE_THRESHOLD = 2; // Adjust as needed

function findCommand(
  commands: CommandInfo[],
  args: string[],
): CommandInfo | undefined {
  if (!args[0]) return undefined;

  const closestCommand = commands.find((cmd) => {
    const dist = distance(cmd.command, args[0]);
    return dist <= DISTANCE_THRESHOLD;
  });

  if (closestCommand?.subCommands && args[1]) {
    return findCommand(closestCommand.subCommands, args.slice(1));
  }

  return closestCommand;
}

app.event('app_mention', async ({ event, say }) => {
  const args = event.text.split(' ').slice(1); // removing the @mention
  const command = findCommand(commands, args);

  if (command) {
    if (command.action) {
      command.action(args.slice(1), event, say, app);
    } else if (command.subCommands) {
      // If there's no action but there are subcommands, show help for the command
      await say(generateHelpForCommand(command));
    }
  } else {
    const user = event.user ? `<@${event.user}> ` : null;
    await say(
      `${user}Sorry, I don't understand that command. Try \`help\` for more information.`,
    );
  }
});

(async () => {
  // Start the app
  await app.start(process.env.PORT ?? 3000);
})();
