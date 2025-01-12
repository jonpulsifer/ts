import { PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/dark-mode-toggle';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { getInitials } from '@/lib/utils';
import {
  getUserWishlistsWithMemberCount,
  getWishlists,
} from '@/lib/db/queries-cached';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';

export default async function Wishlists() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const wishlists = await getWishlists();
  const userWishlists = await getUserWishlistsWithMemberCount(session.user.id);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Wishlists</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ModeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="container max-w-3xl mx-auto">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Join a Wishlist</CardTitle>
                <CardDescription>
                  Select a wishlist and enter the PIN to join
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="wishlist">Select Wishlist</Label>
                  <Select>
                    <SelectTrigger className="max-w-md">
                      <SelectValue placeholder="Choose a wishlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {wishlists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">4-Digit PIN</Label>
                  <InputOTP maxLength={4}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-sm text-muted-foreground">
                    Enter the 4-digit PIN provided by the wishlist creator
                  </p>
                </div>

                <Button size="lg" className="mt-6">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Join Wishlist
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Active Wishlists</CardTitle>
                <CardDescription>
                  Here are the wishlists you are a member of
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {userWishlists.map((list) => (
                    <AccordionItem key={list.id} value={list.id}>
                      <AccordionTrigger className="hover:no-underline gap-2">
                        <div className="flex flex-1 items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{list.name}</h3>
                            <p className="text-sm text-muted-foreground text-left">
                              {list._count.members} members
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="secondary" className="rounded-lg">
                              PIN: {list.password}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="px-4 pt-2 space-y-2">
                          <Table>
                            <TableBody>
                              {list.members?.map((member) => (
                                <TableRow key={member.id}>
                                  <TableCell className="flex items-center gap-2">
                                    <Avatar>
                                      <AvatarImage
                                        src={member.image ?? undefined}
                                      />
                                      <AvatarFallback>
                                        {getInitials(member)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {member.name ?? member.email}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        member._count?.gifts < 3
                                          ? 'destructive'
                                          : 'default'
                                      }
                                    >
                                      {member._count?.gifts ?? 0} gift
                                      {(member._count?.gifts ?? 0) === 1
                                        ? ''
                                        : 's'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="flex justify-end">
                            <Button variant="destructive" size="sm">
                              Leave Wishlist
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
