'use server';

import { exec } from 'node:child_process';
import dns from 'node:dns/promises';
import util from 'node:util';
import { revalidatePath } from 'next/cache';

const execPromise = util.promisify(exec);

// Define allowed network tools as an enum
enum NetworkTool {
  DNS = 'dns',
  WHOIS = 'whois',
  PING = 'ping',
  SSL = 'ssl',
}

// Define exact commands as constants to prevent any command injection
const ALLOWED_COMMANDS = {
  [NetworkTool.WHOIS]: (domain: string) => `whois ${domain}`,
  [NetworkTool.PING]: (domain: string) => `ping -c 4 ${domain}`,
  [NetworkTool.SSL]: (domain: string) =>
    `echo | openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -text`,
  [NetworkTool.DNS]: null,
} as const;

// Strict domain validation
function isValidDomain(domain: string): boolean {
  const pattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return pattern.test(domain) && domain.length < 255;
}

async function execSafeCommand(
  tool: NetworkTool,
  domain: string,
): Promise<string> {
  'use server';

  // Validate domain
  if (!isValidDomain(domain)) {
    throw new Error('Invalid domain format');
  }

  // Ensure tool is valid
  if (!(tool in ALLOWED_COMMANDS)) {
    throw new Error('Invalid tool specified');
  }

  try {
    // Get the predefined command function
    const commandFn = ALLOWED_COMMANDS[tool];
    if (commandFn === null) {
      throw new Error('Tool does not support command execution');
    }
    // Execute the command with the validated domain
    const { stdout } = await execPromise(commandFn(domain));
    return stdout;
  } catch (error) {
    // Don't expose internal error details to client
    throw new Error(`Failed to execute ${tool} command`);
  }
}

export async function performNetworkAction(
  _currentState: any,
  formData: FormData,
) {
  'use server';

  const tool = formData.get('tool') as string;
  const target = formData.get('target') as string;

  if (!tool || !target) {
    throw new Error('Tool and target are required');
  }

  // Validate tool using the enum
  if (!Object.values(NetworkTool).includes(tool as NetworkTool)) {
    throw new Error('Invalid tool specified');
  }

  try {
    // Type assertion is now safe because we validated against the enum
    const result = await (async () => {
      switch (tool as NetworkTool) {
        case NetworkTool.DNS: {
          const results = await Promise.all([
            dns.resolve(target, 'A').catch(() => []),
            dns.resolve(target, 'AAAA').catch(() => []),
            dns.resolve(target, 'MX').catch(() => []),
            dns.resolve(target, 'TXT').catch(() => []),
            dns.resolve(target, 'NS').catch(() => []),
          ]);

          return {
            A: results[0],
            AAAA: results[1],
            MX: results[2],
            TXT: results[3],
            NS: results[4],
          };
        }

        case NetworkTool.WHOIS: {
          console.log(`[AUDIT] WHOIS lookup: ${target}`);
          const output = await execSafeCommand(NetworkTool.WHOIS, target);
          return { result: { output } };
        }

        case NetworkTool.PING: {
          console.log(`[AUDIT] PING: ${target}`);
          const output = await execSafeCommand(NetworkTool.PING, target);
          return { result: { output } };
        }

        case NetworkTool.SSL: {
          console.log(`[AUDIT] SSL check: ${target}`);
          const output = await execSafeCommand(NetworkTool.SSL, target);
          return { result: { output } };
        }

        default:
          console.error(`[AUDIT] Invalid tool specified: ${tool}`);
          return null;
      }
    })();

    // Revalidate the path after successful action
    revalidatePath('/network');

    return { result };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
