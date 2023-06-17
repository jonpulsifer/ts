import Card from 'components/Card';
import Loading from './loading';
import UserForm from 'components/UserForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Suspense } from 'react';
import { getUser } from 'lib/firebase-ssr';
import { Metadata } from 'next';

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
    <Suspense fallback={<Loading />}>
      <Card>
        <div className="flex flex-row items-center">
          <FontAwesomeIcon icon={faAt} className="w-10 text-lg" />
          <Link className="" href={`mailto:${email}`} target="email">
            {email}
          </Link>
        </div>
      </Card>
      <UserForm user={user} />
    </Suspense>
  );
};

export default ProfilePage;
