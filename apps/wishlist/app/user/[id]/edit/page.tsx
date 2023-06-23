import { faAt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Card from 'components/Card';
import Page from 'components/Page';
import UserForm from 'components/UserForm';
import { getUser } from 'lib/firebase-ssr';
import { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await getUser(params.id);
  const { name, email } = user;
  const title = `Edit ${name || email}'s Profile`;
  return {
    title,
    description: title,
  };
}

const ProfilePage = async ({ params }: Props) => {
  const { user } = await getUser(params.id);
  if (!user) return <Card title="User Not Found" />;

  const { email } = user;

  return (
    <Page title={`Edit ${user.name || user.email}`}>
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
