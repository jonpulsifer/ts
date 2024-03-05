'use client';
import { Button, Card, Strong, Text } from '@repo/ui';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

const getTimeAgo = (timestamp: number) => {
  const now = new Date();
  const differenceInMinutes = Math.floor(
    (now.valueOf() - timestamp.valueOf()) / (1000 * 60),
  );

  if (differenceInMinutes < 1) {
    return 'Just now';
  } else if (differenceInMinutes === 1) {
    return '1 minute ago';
  } else if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minutes ago`;
  } else if (differenceInMinutes >= 60 && differenceInMinutes < 120) {
    return '1 hour ago';
  } else if (differenceInMinutes < 1440) {
    return `${Math.floor(differenceInMinutes / 60)} hours ago`;
  } else if (differenceInMinutes < 2880) {
    return '1 day ago';
  } else {
    // For messages over 1 day, you could return the exact time or a different message.
    // Adjust this return statement as needed.
    return 'over 1 day ago 💀';
  }
};

export interface Message {
  id: string;
  timestamp: number;
  sender: string;
  content: string;
}

interface Props {
  name: string;
  messages: Message[];
  sendMessage: (content: string, sender?: string) => void;
  fetchMessages: () => Promise<Message[]>;
}

const Chat = ({
  name,
  messages: messagesFromRedis,
  sendMessage,
  fetchMessages,
}: Props) => {
  const [messages, setMessages] = useState<Message[]>(messagesFromRedis);
  const { data } = useSWR('/not-used', fetchMessages, {
    refreshInterval: 1000,
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };

  // clicking on a badge will post a message to the chat
  const buttonClick = async (message: string) => {
    const now = Date.now();
    setMessages([
      ...messages,
      {
        id: now.toString(),
        timestamp: now,
        sender: 'You',
        content: message,
      },
    ]);
    scrollToBottom();
    sendMessage(message, name);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
    if (data) setMessages(data);
  }, [data, messagesFromRedis]);

  return (
    <Card>
      <div className="overflow-y-scroll h-[calc(75dvh)]">
        <div className="space-y-2">
          {messages.map((message) => (
            <Message key={message.id} message={message} user={name} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="grid">
        <div className="grid grid-cols-4 gap-1">
          <Button color="blue" onClick={() => buttonClick('🔁 Loop')}>
            🔁 Loop
          </Button>
          <Button color="amber" onClick={() => buttonClick('🫘 Bean')}>
            🫘 Bean
          </Button>
          <Button color="orange" onClick={() => buttonClick('🥡 food pls')}>
            🥡 Food
          </Button>
          <Button color="fuchsia" onClick={() => buttonClick('❤️ I love you!')}>
            ❤️ Love
          </Button>
          <Button color="green" onClick={() => buttonClick('👍 Yes')}>
            👍 Yes
          </Button>
          <Button color="red" onClick={() => buttonClick('👎 No')}>
            👎 No
          </Button>
          <Button color="slate" onClick={() => buttonClick('⏲️ Please wait')}>
            ⏲️ Wait
          </Button>
          <Button
            color="dark/slate"
            onClick={() => buttonClick('💀 Go on without me')}
          >
            💀 Dead
          </Button>
        </div>
      </div>
    </Card>
  );
};

const Message = ({ message, user }: { message: Message; user: string }) => {
  const isUser = message.sender === user;
  const sender = isUser ? 'You' : message.sender;
  return (
    <div key={message.id} className="flex flex-col">
      <Text>
        <Strong>{sender}</Strong>
        <span className="text-[10px] ml-1">
          {getTimeAgo(message.timestamp)}
        </span>
      </Text>
      <Text>{message.content}</Text>
    </div>
  );
};

export default Chat;
