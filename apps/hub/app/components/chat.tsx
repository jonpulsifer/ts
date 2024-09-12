'use client';
import { Button } from '@repo/ui';
import { useEffect, useOptimistic, useRef, useState } from 'react';

import {
  deadSayings,
  foodSayings,
  loveSayings,
  thumbsUpSayings,
} from '../lib/chat-messages';
import { howLongAgo } from '../lib/time';

export interface Message {
  id: string;
  timestamp: number;
  sender: string;
  content: string;
}

interface Props {
  name: string;
  messages: Message[];
  sendMessage: (formData: FormData) => void;
  fetchMessages: () => Promise<Message[]>;
}

const Chat = ({
  name,
  sendMessage,
  fetchMessages,
  messages: initialMessages,
}: Props) => {
  const [messages, setMessages] = useState(initialMessages);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    // updateFn aka merge and return new state with optimistic value
    (state, message: Message) => {
      return [...state, message];
    },
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // refresh the chat every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const newMessages = await fetchMessages();
      setMessages(newMessages);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages, setMessages, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [optimisticMessages, initialMessages, messages]);

  // clicking on a badge will submit the form
  const send = async (formData: FormData) => {
    const message = {
      id: `optimistic-${Math.random()}`,
      timestamp: new Date().valueOf(),
      sender: name,
      content: formData.get('messageButton') as string,
    };
    addOptimisticMessage(message);
    // also set messages
    setMessages((messages) => [...messages, message]);
    sendMessage(formData);
  };

  const chatButtons = [
    { emoji: '🫘', content: '🫘 Bean' },
    { emoji: '❤️', content: loveSayings },
    { emoji: '👍', content: thumbsUpSayings },
    { emoji: '💀', content: deadSayings },
    { emoji: '👀', content: '👀 doin?' },
    { emoji: '🍔', content: foodSayings },
    { emoji: '🔁', content: '🔁 Loop?' },
    { emoji: '🔫', content: '🔫 the bomb has been planted' },
  ];

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {optimisticMessages?.map((message) => (
            <Message key={message.id} message={message} user={name} />
          ))}
          <div ref={chatContainerRef} />
        </div>

        <div className="flex-none">
          <form action={send} className="flex flex-col h-full">
            <div className="grid grid-cols-4 gap-2">
              {chatButtons.map(({ emoji, content }, index) => (
                <Button
                  outline
                  key={emoji + index}
                  name="messageButton"
                  value={typeof content === 'function' ? content() : content}
                  type="submit"
                >
                  <span className="text-4xl">{emoji}</span>
                </Button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const Message = ({ message, user }: { message: Message; user: string }) => {
  const isUser = message.sender === user;

  return (
    <div
      key={message.id}
      className={`flex ${isUser ? 'flex-row-reverse ' : 'flex-row'} mb-4`}
    >
      <div className="flex flex-col">
        <div
          className={`${isUser ? 'bg-blue-600 dark:bg-sky-500 text-white' : 'dark:bg-zinc-700 bg-zinc-200 dark:text-white text-black'} p-2 rounded-lg shadow max-w-xs md:max-w-md my-1`}
        >
          <p className="text-xs font-bold">{isUser ? 'You' : message.sender}</p>
          <p
            className={`text-lg ${message.content.includes('💀') ? 'font-creepster' : 'font-medium'}`}
          >
            {message.content}
          </p>
        </div>
        <p className="text-xs text-right mr-2">
          {howLongAgo(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default Chat;
