import Card from 'components/Card';
export default function Loading() {
  const title = 'Loading...';
  const gifts = [
    {
      id: 'loading',
      name: 'Loading...',
      notes: 'Loading...',
      claimed: false,
      claimedBy: null,
      claimedAt: null,
      createdAt: null,
      updatedAt: null,
    },
  ];
  interface Skel {
    id: string;
    name: string;
    notes: string;
    claimed: boolean;
    claimedBy: string | null;
    claimedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }
  const giftList = (skel: Skel[]) => {
    return skel.map((e, idx) => {
      return (
        <tr
          key={idx}
          className="text-left border-t dark:border-gray-800 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
        >
          <td className="px-4 py-2">
            <div className="flex flex-col">
              <div className="font-semibold text-lg">hi</div>
              foo
            </div>
          </td>
          <td className="px-4 py-2">
            <div className="grid justify-items-end">lol</div>
          </td>
        </tr>
      );
    });
  };
  return (
    <div className="h-full w-full items-center justify-center">
      <Card key={gifts[0].id} title={title}>
        <table className="table-auto w-full rounded-lg">
          <tbody>{giftList(gifts)}</tbody>
        </table>
      </Card>
    </div>
  );
}
