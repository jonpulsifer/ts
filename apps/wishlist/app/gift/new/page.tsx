import Card from '../../../components/Card';
import Frame from '../../../components/Frame';
import GiftForm from '../../../components/GiftForm';

const NewGiftPage = () => {
  return (
    <Frame title="Add a Gift">
      <Card>
        <GiftForm />
      </Card>
    </Frame>
  );
};

export default NewGiftPage;
