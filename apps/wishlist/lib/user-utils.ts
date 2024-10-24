import type { User } from '@prisma/client';

export function getInitials(user: User): string {
  if (user.name?.trim()) {
    return user.name.trim().charAt(0).toUpperCase();
  }

  if (user.email?.trim()) {
    return user.email.trim().charAt(0).toUpperCase();
  }

  return '?';
}
