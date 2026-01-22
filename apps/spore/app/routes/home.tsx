import { HostsTable } from '~/components/hosts-table';
import {
  createHost,
  deleteHost,
  getHosts,
  getProfiles,
  updateHost,
} from '~/lib/actions';
import type { Route } from './+types/home';

export const meta: Route.MetaFunction = () => [
  { title: 'Spore - iPXE Boot Manager' },
  { name: 'description', content: 'Manage iPXE boot scripts and hosts' },
];

export async function loader() {
  const [hosts, profiles] = await Promise.all([getHosts(), getProfiles()]);
  return { hosts, profiles };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const macAddress = formData.get('macAddress') as string;

  if (intent === 'create') {
    const hostname = formData.get('hostname') as string;
    const profileIdStr = formData.get('profileId') as string;
    const variables = formData.get('variables') as string;

    await createHost({
      macAddress,
      hostname: hostname || null,
      profileId:
        profileIdStr && profileIdStr !== 'none' ? Number(profileIdStr) : null,
      variables: variables || null,
    });
  } else if (intent === 'update') {
    const hostname = formData.get('hostname') as string;
    const profileIdStr = formData.get('profileId') as string;
    const variables = formData.get('variables') as string;

    await updateHost(macAddress, {
      hostname: hostname || null,
      profileId:
        profileIdStr && profileIdStr !== 'none' ? Number(profileIdStr) : null,
      variables: variables || null,
    });
  } else if (intent === 'delete') {
    await deleteHost(macAddress);
  }

  return { ok: true };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { hosts, profiles } = loaderData;

  return (
    <div className="space-y-6">
      <HostsTable hosts={hosts} profiles={profiles} />
    </div>
  );
}
