'use client';

import { addGift } from '@/app/actions';
import type { GiftFormData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@prisma/client';
import { Loader2, Plus } from 'lucide-react';
import * as React from 'react';
import { useActionState } from 'react';

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        'Add to wishlist'
      )}
    </Button>
  );
}

type Props = {
  users: Pick<User, 'id' | 'name' | 'email'>[];
  currentUser: Pick<User, 'id' | 'name' | 'email'>;
};

export function AddGiftDialog({ users, currentUser }: Props) {
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [state, action, isPending] = useActionState(addGift, {
    errors: {},
    message: '',
  });

  const handleAction = async (formData: FormData) => {
    const data: GiftFormData = {
      recipientId: formData.get('recipientId') as string,
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      description: formData.get('description') as string,
    };

    await action(data);
    setOpen(false);
    formRef.current?.reset();
    toast({
      title: 'Gift added successfully!',
      description: `${data.name} has been added to the wishlist.`,
      action: <ToastAction altText="View wishlist">View wishlist</ToastAction>,
    });
  };

  const usersOptions = users.map((user) => {
    const isCurrentUser = user.id === currentUser.id;
    const name = isCurrentUser
      ? `You (${user.name || user.email})`
      : user.name || user.email;
    return (
      <SelectItem key={user.id} value={user.id}>
        {name}
      </SelectItem>
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Gift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add a new gift</DialogTitle>
          <DialogDescription>
            Use the form below to add a new gift to the wishlist
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleAction} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipientId" className="font-bold">
              Recipient
            </Label>
            <Select name="recipientId" defaultValue={currentUser.id}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>People</SelectLabel>
                  {usersOptions}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.recipientId && (
              <p className="text-sm text-red-500">{state.errors.recipientId}</p>
            )}
            <Label
              htmlFor="recipientId"
              className="text-xs text-muted-foreground font-normal"
            >
              Who is this gift for?
            </Label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-bold">
              Gift Name
            </Label>
            <Input id="name" name="name" placeholder="Enter gift name" />
            {state.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url" className="font-bold">
              Link (optional)
            </Label>

            <Input
              id="url"
              name="url"
              placeholder="https://amazon.ca/your-gift-link"
              type="url"
            />
            {state.errors?.url && (
              <p className="text-sm text-red-500">{state.errors.url}</p>
            )}
            <Label htmlFor="url" className="text-xs text-muted-foreground">
              Remember that Amazon is also available in Canada
            </Label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="font-bold">
              Notes (optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add any additional notes..."
              className="min-h-[100px]"
            />
            {state.errors?.description && (
              <p className="text-sm text-red-500">{state.errors.description}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <SubmitButton isPending={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
