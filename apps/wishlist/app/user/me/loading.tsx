import { faSignIn } from '@fortawesome/free-solid-svg-icons';
import Spinner from 'components/Spinner';
export default function Loading() {
  return <Spinner icon={faSignIn} />;
}
