'use client';

import type { Gift } from '@prisma/client';
import { Button, Description, Field, Input, Label, Textarea } from '@repo/ui';
import { addGift, updateGift } from 'app/actions';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Props {
  gift?: Gift;
}

function GiftForm({ gift }: Props) {
  const router = useRouter();
  const upsertGift = async (formData: FormData) => {
    const name = formData.get('name');
    const url = formData.get('url');
    const description = formData.get('description');
    if (!name) {
      toast.error('Please fill out a name');
      return;
    }

    const operation = gift
      ? updateGift({
          id: gift.id,
          name: name as string,
          url: url as string,
          description: description as string,
        })
      : addGift({
          name: name as string,
          url: url as string,
          description: description as string,
          recipient: '',
        });

    const result = await operation;
    if (result?.error) {
      toast.error(result.error);
    } else {
      gift
        ? toast.success(`Saved ${name}!`)
        : toast.success(`Added ${name} to your wishlist!`);
    }
  };

  return (
    <form
      action={upsertGift}
      className="flex flex-col p-4 space-y-4 text-left"
      id="upsertGift"
    >
      <Field>
        <Label>What&apos;s the name of the thing you wish for?</Label>
        <Input
          autoComplete="name"
          defaultValue={gift?.name || ''}
          name="name"
          placeholder="Red Mittens"
          type="text"
        />
      </Field>

      <Field>
        <Label>Where can we find it? (optional)</Label>
        <Description>
          Remember that Amazon is also available in Canada!
        </Description>
        <Input
          autoComplete="url"
          defaultValue={gift?.url || ''}
          id="url"
          name="url"
          placeholder="https://amazon.ca/ur-favourite-slippers"
          type="textbox"
        />
      </Field>

      <Field>
        <Label>Notes (optional)</Label>
        <Textarea
          autoComplete="notes"
          defaultValue={gift?.description || ''}
          id="notes"
          name="description"
          placeholder="..."
        />
      </Field>
      <Button color="green" type="submit" form="upsertGift">
        <Save size={16} />
        {gift ? 'Save changes' : 'Add to wishlist'}
      </Button>
      <Button outline onClick={() => router.back()}>
        Cancel
      </Button>
    </form>
  );
}

export default GiftForm;
