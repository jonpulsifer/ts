/**
 * Template rendering utilities for iPXE scripts and configuration files.
 *
 * Supports JavaScript template literal syntax: ${variable}
 * Supports nested keys: ${host.macAddress}, ${variables.custom_arg}
 */

export type TemplateContext = Record<string, unknown>;

/**
 * Safely gets a nested value from an object using dot notation.
 * @example getValue({ host: { mac: 'aa:bb:cc' } }, 'host.mac') => 'aa:bb:cc'
 */
function getValue(obj: TemplateContext, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Renders a template string by replacing ${...} placeholders with values from context.
 *
 * @param template - The template string containing ${...} placeholders
 * @param context - The context object containing values to substitute
 * @returns The rendered template with placeholders replaced
 *
 * @example
 * renderTemplate('Hello ${name}!', { name: 'World' })
 * // => 'Hello World!'
 *
 * @example
 * renderTemplate('MAC: ${host.macAddress}', { host: { macAddress: 'aa:bb:cc:dd:ee:ff' } })
 * // => 'MAC: aa:bb:cc:dd:ee:ff'
 */
export function renderTemplate(
  template: string,
  context: TemplateContext,
): string {
  // Match ${...} but not $${...} (escaped)
  const pattern = /\$\{([^}]+)\}/g;

  return template.replace(pattern, (_match, path: string) => {
    const trimmedPath = path.trim();
    const value = getValue(context, trimmedPath);

    if (value === undefined || value === null) {
      // Return empty string for undefined/null values
      // This is intentional - missing vars become empty rather than breaking the script
      return '';
    }

    // Convert value to string
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  });
}

/**
 * Parses a JSON string safely, returning an empty object on failure.
 */
export function parseVariables(
  json: string | null | undefined,
): TemplateContext {
  if (!json) {
    return {};
  }

  try {
    const parsed = JSON.parse(json);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as TemplateContext;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Builds a complete template context for a host boot request.
 */
export function buildBootContext(
  origin: string,
  host: {
    macAddress: string;
    hostname?: string | null;
    variables?: string | null;
  },
  profile?: {
    name: string;
    variables?: string | null;
  } | null,
): TemplateContext {
  const hostVars = parseVariables(host.variables);
  const profileVars = profile ? parseVariables(profile.variables) : {};

  return {
    // Built-in variables
    SPORE_ORIGIN: origin,
    // Host info
    host: {
      macAddress: host.macAddress,
      hostname: host.hostname || '',
    },
    // Profile info
    profile: profile
      ? {
          name: profile.name,
        }
      : null,
    // Merged variables (host overrides profile)
    ...profileVars,
    ...hostVars,
  };
}
