'use client';

import {
  Circle,
  FileCode,
  Home,
  ScrollText,
  Server,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/hosts', label: 'Hosts', icon: Server },
  { href: '/profiles', label: 'Profiles', icon: FileCode },
  { href: '/scripts', label: 'Scripts', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function SporeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth="1.5"
      stroke="currentColor"
    >
      {/* Main spore body */}
      <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.9" />
      {/* Smaller spores floating around */}
      <circle cx="5" cy="8" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="19" cy="9" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="7" cy="18" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="17" cy="17" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="4" cy="14" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="20" cy="14" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 flex-col border-r border-border bg-card">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-spore text-spore-foreground glow-spore-sm">
            <SporeIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-lg font-bold tracking-tight">
              spore
            </span>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              ipxe boot mgr
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-2 py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded px-3 py-2.5 font-mono text-base transition-colors',
                    isActive
                      ? 'bg-spore text-spore-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label.toLowerCase()}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border p-4">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-spore mr-2 animate-pulse" />
          10.2.0.11:3000
        </div>
      </div>
    </nav>
  );
}
