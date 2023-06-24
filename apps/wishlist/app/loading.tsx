import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import Spinner from 'components/Spinner';

const Loading = () => {
  return <Spinner icon={faSnowflake} />;
};

export default Loading;
