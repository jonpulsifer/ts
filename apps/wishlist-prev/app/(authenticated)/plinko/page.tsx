import ChristmasPlinko from './plinko';

export default async function PlinkoPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Christmas Plinko</h1>
      <div className="flex flex-col items-center justify-center">
        <ChristmasPlinko />
      </div>
    </div>
  );
}
