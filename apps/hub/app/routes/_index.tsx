import type { MetaFunction } from '@remix-run/node';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Home,
  Moon,
  Radio,
  Send,
  Smile,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Card, CardContent } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { cn } from '~/lib/utils';

type Message = {
  text: string;
  sender: 'user' | 'hub';
};

type Event = {
  name: string;
  date: Date;
};

const emojiList = [
  { emoji: '😊' },
  { emoji: '😂' },
  { emoji: '🥰' },
  { emoji: '😎' },
  { emoji: '🤔' },
  { emoji: '👍' },
  { emoji: '👎' },
  { emoji: '👋' },
  { emoji: '🎉' },
  { emoji: '🌟' },
  { emoji: '🍕' },
  { emoji: '🍔' },
  { emoji: '🍦' },
  { emoji: '🍷' },
  { emoji: '☕' },
  { emoji: '🏠' },
  { emoji: '🚗' },
  { emoji: '✈️' },
  { emoji: '⏰' },
  { emoji: '📚' },
];

export const meta: MetaFunction = () => {
  return [
    { title: 'Hub Remixed' },
    { name: 'description', content: 'Welcome to Hub Remixed!' },
  ];
};

export default function Index() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Welcome to your Home Hub!', sender: 'hub' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    { name: 'New Year', date: new Date(currentTime.getFullYear() + 1, 0, 1) },
  ]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState<Date>();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: 'Thanks for your message!', sender: 'hub' },
        ]);
      }, 1000);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const addEvent = () => {
    if (newEventName && newEventDate) {
      setEvents([
        ...events,
        { name: newEventName, date: new Date(newEventDate) },
      ]);
      setNewEventName('');
      setNewEventDate(undefined);
    }
  };

  const getDaysUntil = (date: Date) => {
    const diff = date.getTime() - currentTime.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="w-[800px] h-[480px] overflow-hidden">
      <div className="grid grid-cols-3 gap-2 h-full p-2">
        <div className="col-span-2 space-y-4 overflow-y-scroll">
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-bold">
                  {currentTime.toLocaleTimeString()}
                </h2>
                <p className="text-xl">{currentTime.toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Sun className="w-12 h-12" />
                <div>
                  <h3 className="text-2xl font-semibold">23°C</h3>
                  <p>Sunny</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold mb-2">Funny Buttons</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex flex-col items-center"
                >
                  <Sun className="w-6 h-6 mb-1" />
                  Button 1
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center"
                >
                  <Moon className="w-6 h-6 mb-1" />
                  Button 2
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center"
                >
                  <Home className="w-6 h-6 mb-1" />
                  Button 3
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center"
                >
                  <Radio className="w-6 h-6 mb-1" />
                  Button 4
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Days Until</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Event</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newEventName}
                          onChange={(e) => setNewEventName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[280px] justify-start text-left font-normal',
                                !newEventDate && 'text-muted-foreground',
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newEventDate ? (
                                format(newEventDate, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newEventDate}
                              onSelect={setNewEventDate}
                              fromDate={currentTime}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Button onClick={addEvent}>Add Event</Button>
                  </DialogContent>
                </Dialog>
              </div>
              <div className=" overflow-y-scroll h-[calc(100vh/6)]">
                <ul className="space-y-2">
                  {events.map((event, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>{event.name}</span>
                      <span className="font-bold">
                        {getDaysUntil(event.date)} days
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 flex flex-col overflow-y-scroll">
          <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">Chat</h3>
              <div className="flex-grow overflow-y-auto mb-2">
                <div className="space-y-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`rounded-lg p-2 max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow"
                  />
                  <Button
                    onClick={() => setShowEmojiKeyboard(!showEmojiKeyboard)}
                    variant="outline"
                    size="icon"
                    aria-label="Toggle emoji keyboard"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={sendMessage}
                    variant="default"
                    size="icon"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {showEmojiKeyboard && (
                  <div className="p-2 bg-secondary rounded-lg max-h-32">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold">Emoji Keyboard</h4>
                      <Button
                        onClick={() => setShowEmojiKeyboard(false)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {emojiList.map(({ emoji }) => (
                        <Button
                          key={emoji}
                          onClick={() => addEmoji(emoji)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
