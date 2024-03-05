'use client';
import { Badge, Button, Card, Field, Input, Strong, Text } from '@repo/ui';

const getTimeAgo = (timestamp: string) => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const differenceInMinutes = Math.floor(
    (now.valueOf() - messageDate.valueOf()) / (1000 * 60),
  );

  if (differenceInMinutes < 1) {
    return 'Just now';
  } else if (differenceInMinutes === 1) {
    return '1 minute ago';
  } else if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minutes ago`;
  } else {
    // For messages over 59 minutes, you could return the exact time or a different message.
    // Adjust this return statement as needed.
    return 'over an hour ago';
  }
};

const messages = [
  {
    id: 1,
    text: 'Hello bean! 🫘',
    sender: 'Bonnicus',
    timestamp: '2024-03-04T12:00:00Z',
  },
  {
    id: 2,
    text: 'I love you!',
    sender: 'Bean',
    timestamp: '2024-03-04T12:01:00Z',
  },
];
const Chat = () => {
  return (
    <Card>
      <div className="flex flex-col gap-2">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col gap-1">
            <Text>
              <Strong>{message.sender}</Strong>
              <p className="text-xs">{getTimeAgo(message.timestamp)}</p>
            </Text>
            <Text>{message.text}</Text>
          </div>
        ))}
      </div>
      <div className="flex flex-col mt-5 space-y-2">
        <div className="flex flex-row gap-2">
          <Badge color="blue">🔁 Loop</Badge>
          <Badge color="green">🥡 Food</Badge>
          <Badge color="amber">🫘 Beans</Badge>
          <Badge color="red">🛑 Meet</Badge>
        </div>
        <Field className="flex flex-row gap-2">
          <Input type="text" placeholder="Send a message..." />
          <Button>Send</Button>
        </Field>
      </div>
    </Card>
  );
};

export default Chat;
