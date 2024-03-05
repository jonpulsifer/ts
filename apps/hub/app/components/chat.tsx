'use client';
import { Badge, Button, Card, Field, Input, Strong, Text } from '@repo/ui';
import { useEffect, useRef, useState } from 'react';

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

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(
    [
      {
        id: 1,
        text: 'Hello bean! 🫘',
        sender: 'Bonnicus',
        timestamp: '2024-03-05T02:44:00Z',
      },
      {
        id: 2,
        text: 'I love you!',
        sender: 'Bean',
        timestamp: '2024-03-04T12:01:00Z',
      },
      {
        id: 3,
        text: 'I love you more!',
        sender: 'Bonnicus',
        timestamp: '2024-03-04T12:02:00Z',
      },
      {
        id: 4,
        text: 'I love you most!',
        sender: 'Bean',
        timestamp: '2024-03-04T12:03:00Z',
      },
      {
        id: 5,
        text: 'I love you mostest!',
        sender: 'Bonnicus',
        timestamp: '2024-03-04T12:04:00Z',
      },
      {
        id: 6,
        text: 'I love you mostestest!',
        sender: 'Bean',
        timestamp: '2024-03-04T12:05:00Z',
      },
      {
        id: 7,
        text: 'I love you mostestestest!',
        sender: 'Bonnicus',
        timestamp: '2024-03-04T12:06:00Z',
      },
      {
        id: 8,
        text: 'I love you mostestestestest!',
        sender: 'Bean',
        timestamp: '2024-03-04T12:07:00Z',
      },
      {
        id: 9,
        text: 'I love you mostestestestestest!',
        sender: 'Bonnicus',
        timestamp: '2024-03-04T12:08:00Z',
      },
      {
        id: 10,
        text: 'I love you mostestestestestestest!',
        sender: 'Bean',
        timestamp: '2024-03-04T12:09:00Z',
      },
      {
        id: 11,
        text: 'I love you mostestestestestestestest!',
        sender: 'Bonnicus',
        timestamp: '2024-03-04T12:10:00Z',
      },
      {
        id: 12,
        text: 'I love you mostestestestestestestestest!',
        sender: 'Bean',
        timestamp: '2024-03-04T12:11:00Z',
      },
    ].reverse(),
  );

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // clicking on a badge will post a message to the chat
  const badgeClick = (message: string) => {
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: message,
        sender: 'You',
        timestamp: new Date().toISOString(),
      },
    ]);
    scrollToBottom();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card>
      <div className="flex flex-col max-h-80 overflow-y-scroll">
        <div className="space-y-2">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex flex-col mt-5 space-y-2">
        <div className="flex flex-row gap-2">
          <Badge color="blue" onClick={() => badgeClick('🔁 Loop')}>
            🔁 Loop
          </Badge>
          <Badge color="green" onClick={() => badgeClick('🥡 Food')}>
            🥡 Food
          </Badge>
          <Badge color="amber" onClick={() => badgeClick('🫘 Beans')}>
            🫘 Beans
          </Badge>
          <Badge color="red" onClick={() => badgeClick('🛑 Meet')}>
            🛑 Meet
          </Badge>
        </div>
        <Field className="flex flex-row gap-2">
          <Input type="text" placeholder="Send a message..." />
          <Button>Send</Button>
        </Field>
      </div>
    </Card>
  );
};

const Message = ({ message }: { message: Message }) => {
  return (
    <div key={message.id} className="flex flex-col">
      <Text>
        <Strong>{message.sender}</Strong>
        <span className="text-[10px] ml-1">
          {getTimeAgo(message.timestamp)}
        </span>
      </Text>
      <Text>{message.text}</Text>
    </div>
  );
};

export default Chat;
