import { distance } from 'fastest-levenshtein';

const DISTANCE_THRESHOLD = 2;

export function generateHelpForCommand(cmd: any, prefix = ''): string {
  if (typeof cmd === 'function') {
    return `\`${prefix}\` - Available command\n`;
  }

  let helpText = '';
  for (const [subCmd, value] of Object.entries(cmd)) {
    if (typeof value === 'function') {
      helpText += `\`${prefix}${subCmd}\` - Available command\n`;
    } else if (typeof value === 'object') {
      helpText += generateHelpForCommand(value, `${prefix}${subCmd} `);
    }
  }
  return helpText;
}

export function generateHelp(commands: any): string {
  let helpText = 'I can help you with the following commands:\n';
  helpText += generateHelpForCommand(commands);
  return helpText;
}

export function findCommand(commands: any, args: string[]): any {
  if (args.length === 0) return undefined;

  const [currentArg, ...restArgs] = args;
  const closestCommand = Object.keys(commands).find((cmd) => {
    const dist = distance(cmd, currentArg);
    return dist <= DISTANCE_THRESHOLD;
  });

  if (closestCommand) {
    const command = commands[closestCommand];
    if (typeof command === 'function' || restArgs.length === 0) {
      return command;
    } else if (typeof command === 'object') {
      return findCommand(command, restArgs);
    }
  }

  return undefined;
}
