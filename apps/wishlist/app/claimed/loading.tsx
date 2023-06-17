import Card from 'components/Card';
export default function Loading() {
  return (
    <Card
      title="🎁 Loading moar gifts.."
      subtitle="The elves are searching for some more gifts..."
    >
      <div className="p-4">
        <p>The elves are loading up the sleigh, hang tight.</p>
      </div>
    </Card>
  );
}
