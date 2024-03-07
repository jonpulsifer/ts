'use client';
import { Button, Card } from '@repo/ui';
import { useEffect, useOptimistic, useRef } from 'react';

import {
  deadSayings,
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

const Chat = ({ name, sendMessage, messages }: Props) => {
  // check if the form is being submitted
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

  useEffect(() => {
    scrollToBottom();
  }, [optimisticMessages, messages]);

  // clicking on a badge will submit the form
  const send = async (formData: FormData) => {
    addOptimisticMessage({
      id: 'optimistic-' + Math.random(),
      timestamp: new Date().valueOf(),
      sender: name,
      content: formData.get('messageButton') as string,
    });
    sendMessage(formData);
  };

  const emojiButtons = [
    { icon: '🫘', value: 'Bean' },
    { icon: '❤️', value: loveSayings },
    { icon: '👍', value: thumbsUpSayings },
    { icon: '💀', value: deadSayings },
    { icon: '👀', value: '👀 doin?' },
    { icon: '🍔', value: '🍔 food pls' },
    { icon: '🔁', value: '🔁 Loop?' },
    { icon: '🔫', value: '🔫 pew pew' },
  ];

  return (
    <Card className="h-full dark:bg-black">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {optimisticMessages.map((message) => (
            <Message key={message.id} message={message} user={name} />
          ))}
          <div ref={chatContainerRef} />
        </div>

        <div className="flex-none">
          <form action={send} className="flex flex-col h-full">
            <div className="grid grid-cols-4 gap-2">
              {emojiButtons.map((emoji) => (
                <Button
                  key={emoji.value as string}
                  name="messageButton"
                  value={
                    typeof emoji.value === 'function'
                      ? emoji.value()
                      : emoji.value
                  }
                  color="light"
                  type="submit"
                >
                  <span className="text-2xl">{emoji.icon}</span>
                </Button>
              ))}
            </div>
          </form>
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
      className={`flex ${isUser ? 'flex-row-reverse ' : 'flex-row'} mb-4`}
    >
      <div className="flex flex-col">
        <div
          className={`${isUser ? 'bg-blue-600 dark:bg-sky-500 text-white' : 'dark:bg-zinc-700 bg-zinc-200 dark:text-white text-black'}   px-4 py-2 rounded-lg shadow max-w-xs md:max-w-md my-1`}
        >
          <p className="text-xs font-bold">{isUser ? 'You' : message.sender}</p>
          <p
            className={`text-xl mt-1 ${message.content.includes('💀') ? 'font-creepster' : 'font-bold'}`}
          >
            {message.content}
          </p>
        </div>
        <p className="text-xs text-right mr-2 text-gray-500">
          {howLongAgo(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default Chat;
