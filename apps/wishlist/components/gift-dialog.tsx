'use client';
import type { User } from '@prisma/client';
import {
  Button,
  Description,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  Field,
  Input,
  Label,
  Listbox,
  ListboxLabel,
  ListboxOption,
  Textarea,
} from '@repo/ui';
import { addGift } from 'app/actions';
import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser: User;
  users: User[];
};

export default function GiftDialog({
  isOpen,
  setIsOpen,
  users,
  currentUser,
}: Props) {
  const cancelButtonRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeAndReset = () => {
    setIsOpen(false);
    formRef.current?.reset();
  };

  const handleAddGift = async (formData: FormData) => {
    const name = formData.get('name');
    const url = formData.get('url');
    const description = formData.get('description');
    const recipient = formData.get('recipient');
    if (!name) {
      toast.error('Please fill out a name');
      return;
    }

    const result = await addGift({
      name: name as string,
      url: url as string,
      description: description as string,
      recipient: recipient as string,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      const recipientUser = users.find((user) => user.id === recipient);
      const recipientName =
        recipientUser?.id === currentUser.id
          ? 'your'
          : `${recipientUser?.name || recipientUser?.email}'s`;
      toast.success(`Added ${name} to ${recipientName} wishlist!`);
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  };

  const usersOptions = users.map((user) => {
    const isCurrentUser = user.id === currentUser.id;
    const name = isCurrentUser
      ? `You (${user.name || user.email})`
      : user.name || user.email;
    return (
      <ListboxOption key={user.id} value={user.id}>
        <ListboxLabel>{name}</ListboxLabel>
      </ListboxOption>
    );
  });

  function Submit() {
    const status = useFormStatus();
    return (
      <Button type="submit" color="green" disabled={status.pending}>
        {status.pending ? 'Adding...' : 'Add to wishlist'}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onClose={setIsOpen}>
      <form action={handleAddGift} ref={formRef}>
        <DialogTitle>Add a new gift!</DialogTitle>
        <DialogDescription>
          Use the form below to add a new gift to your wishlist
        </DialogDescription>
        <DialogBody className="space-y-4">
          <Field>
            <Label>Recipient</Label>
            <Description>Who is this gift for?</Description>
            <Listbox name="recipient" defaultValue={currentUser.id}>
              {usersOptions}
            </Listbox>
          </Field>
          <Field>
            <Label>Gift Name</Label>
            <Input
              autoFocus
              autoComplete="name"
              name="name"
              placeholder="Red Mittens"
              type="text"
              ref={inputRef}
            />
          </Field>
          <Field>
            <Label>Link (optional)</Label>
            <Description>
              Remember that Amazon is also available in Canada
            </Description>
            <Input
              autoComplete="url"
              inputMode="url"
              name="url"
              placeholder="https://amazon.ca/ur-favourite-slippers"
              type="url"
            />
          </Field>

          <Field className="col-span-full">
            <Label>Notes (optional)</Label>
            <Textarea
              autoComplete="description"
              name="description"
              placeholder="..."
            />
          </Field>
        </DialogBody>

        <DialogActions>
          <Button
            outline
            onClick={() => {
              closeAndReset();
            }}
            ref={cancelButtonRef}
            type="button"
          >
            Close
          </Button>
          <Submit />
        </DialogActions>
      </form>
    </Dialog>
  );
}
