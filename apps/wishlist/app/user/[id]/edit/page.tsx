import { faAt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Page from 'components/Page';
import UserForm from 'components/UserForm';
import { getUserById } from 'lib/prisma-ssr';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@repo/ui/card';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUserById(params.id);
  const { name, email } = user;
  const title = `Edit ${name || email}'s Profile`;
  return {
    title,
    description: title,
  };
}

const ProfilePage = async ({ params }: Props) => {
  const user = await getUserById(params.id);
  if (!user) return <Card title="User Not Found" />;

  const { email } = user;

  return (
    <Page>
      {user ? (
        <>
          <Card>
            <div className="flex flex-row items-center">
              <FontAwesomeIcon icon={faAt} className="w-10 text-lg" />
              <Link className="" href={`mailto:${email}`} target="email">
                {email}
              </Link>
            </div>
          </Card>
          <UserForm user={user} />
        </>
      ) : (
        <Card title="User Not Found" />
      )}
    </Page>
  );
};

export default ProfilePage;
