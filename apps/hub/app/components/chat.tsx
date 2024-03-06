'use client';
import { Button, Card } from '@repo/ui';
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

const Chat = ({ name, sendMessage, fetchMessages }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { data } = useSWR('/not-used', fetchMessages, {
    refreshInterval: 1000,
  });

  // Inside Chat component
  const scrollToBottom = () => {
    bottomOfChat.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  }, [data]);

  const bottomOfChat = useRef<null | HTMLDivElement>(null);

  // clicking on a badge will post a message to the chat
  const buttonClick = async (message: string) => {
    const now = Date.now();
    // ButtonClick update
    const newMessage = {
      id: now.toString(),
      timestamp: now,
      sender: name,
      content: message,
    };
    setMessages((messages) => [...messages, newMessage]);
    scrollToBottom();
    sendMessage(message, name);
  };

  return (
    <Card className="flex flex-col">
      <div className="">
        <div className=" flex-grow overflow-y-auto max-h-80">
          <div>
            {messages.map((message) => (
              <Message key={message.id} message={message} user={name} />
            ))}
          </div>
          <div ref={bottomOfChat} />
        </div>
        <div className="mt-2">
          <div className="grid grid-cols-4 gap-2">
            <Button color="light" onClick={() => buttonClick('🫘 Bean')}>
              <p className="text-2xl">🫘</p>
            </Button>
            <Button color="light" onClick={() => buttonClick('❤️ I love you!')}>
              <p className="text-2xl">❤️</p>
            </Button>
            <Button
              color="light"
              onClick={() => buttonClick('👍 Without a shadow of a doubt')}
            >
              <p className="text-2xl">👍</p>
            </Button>
            <Button
              color="light"
              onClick={() => buttonClick('💀 Go on without me')}
            >
              <p className="text-2xl">💀</p>
            </Button>
            <Button color="light" onClick={() => buttonClick('👀 doin?')}>
              <p className="text-2xl">👀</p>
            </Button>
            <Button color="light" onClick={() => buttonClick('🍔 food pls')}>
              <p className="text-2xl">🍔</p>
            </Button>
            <Button color="light" onClick={() => buttonClick('🔁 Loop?')}>
              <p className="text-2xl">🔁</p>
            </Button>
            <Button color="light" onClick={() => buttonClick('⏲️ Wait')}>
              <p className="text-2xl">⏲️</p>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Message = ({ message, user }: { message: Message; user: string }) => {
  const isUser = message.sender === user;
  return (
    <div
      key={message.id}
      className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}
    >
      <div className="flex flex-col">
        <div
          className={`${isUser ? 'bg-blue-600 text-white' : 'bg-sky-500 text-white'} px-4 py-2 rounded-lg shadow max-w-xs md:max-w-md my-1`}
        >
          <p className="text-xs font-bold">{isUser ? 'You' : message.sender}</p>
          <p
            className={`text-xl mt-1 ${message.content.includes('💀') ? 'font-creepster' : 'font-bold'}`}
          >
            {message.content}
          </p>
        </div>
        <p className="text-xs text-right mr-2 text-gray-300">
          {getTimeAgo(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default Chat;
