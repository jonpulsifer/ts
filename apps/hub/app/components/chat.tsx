'use client';
import { Button, Card, Field, Input } from '@repo/ui';

const Chat = () => {
  return (
    <Card>
      <Field className="flex flex-row gap-2">
        <Input type="text" placeholder="Send a message..." />
        <Button>Send</Button>
      </Field>
    </Card>
  );
};

export default Chat;
