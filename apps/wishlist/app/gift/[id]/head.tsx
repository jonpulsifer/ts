import { getGift } from '../../../lib/firebase-ssr';
import DefaultTags from '../../DefaultTags';

interface Props {
  params: { [K in string]: string };
}

export default async function Head({ params }: Props) {
  const { gift } = await getGift(params.id);
  const titleMarkup = gift?.name ? `Gift | ${gift.name}` : 'Gift';
  return (
    <>
      <DefaultTags />
      <title>{titleMarkup}</title>
    </>
  );
}
