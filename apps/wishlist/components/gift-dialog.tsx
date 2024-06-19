'use client';
import { User } from '@prisma/client';
import {
  Avatar,
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
  Select,
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

export default function GiftDialog({ isOpen, setIsOpen, users }: Props) {
  const cancelButtonRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);

  const closeAndReset = () => {
    setIsOpen(false);
    formRef.current?.reset();
  };

  const handleAddGift = async (formData: FormData) => {
    const name = formData.get('name');
    const url = formData.get('url');
    const description = formData.get('description');
    if (!name) {
      toast.error('Please fill out a name');
      return;
    }

    const result = await addGift({
      name: name as string,
      url: url as string,
      description: description as string,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added ${name} to your wishlist!`);
      formRef.current?.reset();
    }
  };

  const usersOptions = users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.name || user.email}
      <Avatar src={user.image} />
    </option>
  ));

  function Submit() {
    const status = useFormStatus();
    return (
      <Button type="submit" color="indigo" disabled={status.pending}>
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
            <Label>Project status</Label>
            <Description>
              This will be visible to clients on the project.
            </Description>
            <Select name="status">{usersOptions}</Select>
          </Field>
          <Field>
            <Label>Gift Name</Label>
            <Input
              autoComplete="name"
              name="name"
              placeholder="Red Mittens"
              type="text"
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
          <Submit />
          <Button
            plain
            onClick={() => {
              closeAndReset();
            }}
            ref={cancelButtonRef}
            type="button"
          >
            Close
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
