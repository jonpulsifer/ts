'use client';

import { claimGift, unclaimGift } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import type { GiftWithOwnerAndClaimedByAndCreatedBy } from '@/lib/db/types';
import { getInitials } from '@/lib/utils';
import type { Gift } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useMemo } from 'react';
import { useOptimistic } from 'react';

interface GiftListProps {
  initialGifts: GiftWithOwnerAndClaimedByAndCreatedBy[];
  search: string;
  sort: string;
  direction: string;
}

export function GiftList({
  initialGifts,
  search,
  sort,
  direction,
}: GiftListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [gifts, setGifts] = useOptimistic(initialGifts);

  const updateParams = (params: {
    q?: string;
    sort?: string;
    direction?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    }
    router.push(`?${newParams.toString()}`);
  };

  const debouncedUpdateParams = useDebounce((value: string) => {
    updateParams({ q: value });
  }, 300);

  const filteredAndSortedGifts = useMemo(() => {
    if (!search) {
      return gifts;
    }
    return gifts
      .filter(
        (gift) =>
          gift.name.toLowerCase().includes(search.toLowerCase()) ||
          gift.owner.name?.toLowerCase().includes(search.toLowerCase()) ||
          gift.url?.toLowerCase().includes(search.toLowerCase()) ||
          gift.description?.toLowerCase().includes(search.toLowerCase()) ||
          false,
      )
      .sort((a, b) => {
        switch (sort) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'owner':
            return (a.owner.name ?? '').localeCompare(b.owner.name ?? '');
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
  }, [gifts, search, sort, direction]);

  async function handleClaimToggle(gift: Gift) {
    try {
      // Optimistically update the UI
      startTransition(() => {
        setGifts((prev) =>
          prev.map((g) =>
            g.id === gift.id ? { ...g, claimed: !g.claimed } : g,
          ),
        );
      });

      // Perform the server action
      const result = await (gift.claimed
        ? unclaimGift(gift.id)
        : claimGift(gift.id));

      if (result.success) {
        toast({
          title: 'Gift updated',
          description: result.message,
        });
      } else {
        // Revert on failure
        startTransition(() => {
          setGifts((prev) =>
            prev.map((g) =>
              g.id === gift.id ? { ...g, claimed: !g.claimed } : g,
            ),
          );
        });
        toast({
          title: 'Failed to update gift',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Failed to update gift',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search gifts..."
            defaultValue={search}
            onChange={(e) => debouncedUpdateParams(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by date</SelectItem>
            <SelectItem value="name">Sort by name (A-Z)</SelectItem>
            <SelectItem value="owner">Sort by recipient</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="hidden md:grid md:grid-cols-[1fr,200px,200px,120px] gap-4 p-4 font-medium">
          <div>Gift</div>
          <div>Recipient</div>
          <div>Created</div>
          <div className="text-right">Actions</div>
        </div>

        {filteredAndSortedGifts.map((gift) => (
          <div
            key={gift.id}
            className="grid grid-cols-[1fr,auto] md:grid-cols-[1fr,200px,200px,120px] gap-4 p-4 items-center border-t"
          >
            <div className="space-y-1">
              <div className="font-medium">{gift.name}</div>
              <div className="text-sm text-muted-foreground">
                Created by {gift.createdBy?.name}
              </div>
              <div className="md:hidden text-sm text-muted-foreground flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={gift.owner?.image || undefined} />
                  <AvatarFallback>{getInitials(gift.owner)}</AvatarFallback>
                </Avatar>
                <span>{gift.owner?.name}</span>•{' '}
                {formatDistanceToNow(new Date(gift.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={gift.owner.image ?? undefined} />
                <AvatarFallback>{getInitials(gift.owner)}</AvatarFallback>
              </Avatar>
              <span>{gift.owner.name}</span>
            </div>

            <div className="hidden md:block text-muted-foreground">
              {formatDistanceToNow(new Date(gift.createdAt), {
                addSuffix: true,
              })}
            </div>

            <div className="text-right">
              <Button
                variant={gift.claimed ? 'destructive' : 'default'}
                onClick={() => handleClaimToggle(gift)}
                size="sm"
                className="w-20 md:w-24"
              >
                {gift.claimed ? 'Unclaim' : 'Claim'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
