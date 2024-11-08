'use client';

import { setEmoji, revalidateEmoji } from '@/app/actions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export default function EmojiDisplay({
  initialEmoji,
}: { initialEmoji: string }) {
  const { pending } = useFormStatus();

  return (
    <Card className="w-96 bg-white/80 backdrop-blur-sm shadow-xl">
      <CardContent className="pt-6">
        <div className="text-[180px] text-center leading-none mb-6 transition-all duration-300 ease-in-out transform hover:scale-110">
          {initialEmoji}
        </div>
        <form action={setEmoji} className="space-y-4">
          <Input
            type="text"
            name="emoji"
            placeholder="Enter a new emoji"
            maxLength={2}
            className="text-center text-2xl h-16"
          />
          <div className="flex space-x-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Set New Emoji
            </Button>
            <Button
              formAction={revalidateEmoji}
              variant="outline"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Revalidate + Random Emoji
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
