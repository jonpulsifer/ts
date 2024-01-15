import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import Spinner from 'components/Spinner';

function Loading() {
  return <Spinner icon={faSnowflake} />;
}

export default Loading;
