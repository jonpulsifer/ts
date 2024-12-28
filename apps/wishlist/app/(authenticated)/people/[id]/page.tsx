import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  getUserById,
  getVisibleGiftsForUserById,
} from '@/lib/db/queries-cached';
import { notFound, unauthorized } from 'next/navigation';

import { auth } from '@/app/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getInitials } from '@/lib/utils';
import { Gift, Mail, MapPin, Ruler } from 'lucide-react';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// This would typically come from your database
const mockUser = {
  id: '1',
  name: 'Emily Pulsifer',
  email: 'emily@example.com',
  address: '123 Christmas Lane, North Pole',
  sizes: {
    pants: '6',
    shirt: 'M',
    shoes: '8',
  },
  gifts: [
    {
      id: '1',
      name: 'Cozy Winter Sweater',
      price: 49.99,
      link: 'https://example.com/sweater',
      claimed: false,
    },
    {
      id: '2',
      name: 'Book: The Christmas Carol',
      price: 15.99,
      link: 'https://example.com/book',
      claimed: true,
    },
    // Add more gifts as needed
  ],
};

export default async function UserPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { id } = await params;
  const user = await getUserById(id);
  const gifts = await getVisibleGiftsForUserById(id, session.user.id);
  if (!user) {
    notFound();
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/people">People</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{user?.name || user?.email}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user.name ?? user.email}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Shipping Address</div>
                    <div className="text-sm text-muted-foreground">
                      {user.address}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-2">
                      <div className="font-medium">Sizes</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Pants</div>
                          <div className="text-muted-foreground">
                            {user.pant_size}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Shirt</div>
                          <div className="text-muted-foreground">
                            {user.shirt_size}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Shoes</div>
                          <div className="text-muted-foreground">
                            {user.shoe_size}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Wishlist</CardTitle>
                <Badge variant="secondary">{gifts.length} gifts</Badge>
              </CardHeader>
              <CardContent className="">
                <div className="space-y-4 overflow-hidden">
                  {gifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Gift className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 overflow-hidden">
                          <div className="font-medium truncate">
                            {gift.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-prose hidden md:block">
                            {gift.url}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {gift.claimed ? (
                          <Badge variant="secondary">Claimed</Badge>
                        ) : (
                          <Button size="sm">Claim Gift</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
