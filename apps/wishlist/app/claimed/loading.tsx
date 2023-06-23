import { faGhost } from '@fortawesome/free-solid-svg-icons';
import Spinner from 'components/Spinner';

const Loading = () => {
  return <Spinner icon={faGhost} />;
};

export default Loading;
