import * as os from 'node:os';

import type { MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Code,
  Description,
  Fieldset,
  Label,
  Legend,
  Radio,
  RadioField,
  RadioGroup,
  Strong,
  Text,
} from '@repo/ui';

export const meta: MetaFunction = () => [{ title: 'Hello, Remix' }];

export const loader = async () => {
  const hostname = os.hostname();
  const serverTime = new Date().toISOString(); // Get the current time in ISO format
  const uptime = os.uptime(); // Get the server's uptime in seconds

  // Return a JSON response including the hostname, serverTime, and uptime.
  return json({ ok: true, hostname, serverTime, uptime });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-zinc-800 border border-transparent shadow rounded max-w-sm">
      <div className="p-2 sm:p-4">
        <h1 className="text-3xl font-medium text-black dark:text-white">
          Hello, <span className="font-bold">Remix!</span>
        </h1>
      </div>
      <div className="p-2 sm:p-4">
        <Text>
          Here is some <Strong>loader data</Strong>
        </Text>
        <Code>{JSON.stringify(data, null, 2)}</Code>
      </div>
      <div className="p-2 sm:p-4">
        <Fieldset>
          <Legend>Magical UI Components Below!</Legend>
          <Text>
            Time to decide: Is Remix or Next.js your potion for success?
          </Text>
          <RadioGroup name="frameworkChoice" defaultValue="remixPotion">
            <RadioField>
              <Radio value="remixPotion" />
              <Label>Choose the Remix Elixir</Label>
              <Description>
                Sip this potion and embark on a journey through enchanted lands
                where routes dynamically morph to your desire, and loaders
                sprinkle data like fairy dust, revealing secrets previously
                shrouded in mystery.
              </Description>
            </RadioField>
            <RadioField>
              <Radio value="nextSpell" />
              <Label>Cast the Next.js Spell</Label>
              <Description>
                With this spell, you summon the spirits of Static Generation and
                Server-Side Rendering, weaving them into a powerful incantation
                that conjures web pages at the speed of light, guarded by the
                mystical forces of optimization.
              </Description>
            </RadioField>
          </RadioGroup>
        </Fieldset>
      </div>
    </div>
  );
}
