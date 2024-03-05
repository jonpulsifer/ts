'use client';
import { Badge, Button, Card, Field, Input, Strong, Text } from '@repo/ui';
import { useEffect, useRef, useState } from 'react';

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
  messages: Message[];
  sendMessage: (sender: string, content: string) => void;
}

const Chat = ({ messages: messagesFromRedis, sendMessage }: Props) => {
  const [messages, setMessages] = useState<Message[]>(messagesFromRedis);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // clicking on a badge will post a message to the chat
  const badgeClick = (message: string) => {
    sendMessage('system', message);
    setMessages([
      ...messages,
      {
        id: 'system',
        timestamp: Date.now(),
        sender: 'You',
        content: message,
      },
    ]);
    scrollToBottom();
  };

  // clicking on the send button will post a message to the chat
  const buttonClick = () => {
    const input = document.querySelector('input');
    if (input) {
      sendMessage('You', input.value);
      setMessages([
        ...messages,
        {
          id: 'You',
          timestamp: Date.now(),
          sender: 'You',
          content: input.value,
        },
      ]);
      input.value = '';
      scrollToBottom();
    }
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
          <Badge color="amber" onClick={() => badgeClick('🫘 Bean')}>
            🫘 Bean
          </Badge>
          <Badge color="fuchsia" onClick={() => badgeClick('❤️ Love You')}>
            ❤️ Love You
          </Badge>
        </div>
        <Field className="flex flex-row gap-2">
          <Input type="text" placeholder="Send a message..." />
          <Button onClick={() => buttonClick()}>Send</Button>
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
      <Text>{message.content}</Text>
    </div>
  );
};

export default Chat;
