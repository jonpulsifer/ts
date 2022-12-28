import { getGift } from '../../../../lib/firebase-ssr';

interface Props {
  params: { [K in string]: string };
}

export default async function Head({ params }: Props) {
  const { gift } = await getGift(params.id);
  const titleMarkup = gift?.name ? `Edit Gift | ${gift.name}` : 'Edit Gift';
  return (
    <>
      <title>{titleMarkup}</title>
    </>
  );
}
