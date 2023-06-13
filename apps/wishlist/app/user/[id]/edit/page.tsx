import Card from '../../../../components/Card';
import Frame from '../../../../components/Frame';
import Loading from './loading';
import UserForm from '../../../../components/UserForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Suspense } from 'react';
import { getUser } from '../../../../lib/firebase-ssr';

interface Props {
  params: { [K in string]: string };
}

const ProfilePage = async ({ params }: Props) => {
  const { user } = await getUser(params.id);
  if (!user) return <Card title="User Not Found" />;

  const { email } = user;

  return (
    <Frame title="Edit Profile">
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
    </Frame>
  );
};

export default ProfilePage;
