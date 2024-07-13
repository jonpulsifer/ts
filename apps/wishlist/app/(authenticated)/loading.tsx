import { CubeTransparentIcon } from '@heroicons/react/16/solid';
import Spinner from 'components/Spinner';

function Loading() {
  return <Spinner Icon={CubeTransparentIcon} />;
}

export default Loading;
