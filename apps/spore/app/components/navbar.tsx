import { Disc3, Folder, Network, Server, Terminal } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

export function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-3 mr-8 group">
          <div className="relative h-8 w-8 flex items-center justify-center">
            <Server className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <Network className="h-3 w-3 text-primary/60 absolute bottom-0 right-0" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-xl font-mono tracking-tight text-foreground">
              SPORE
            </span>
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider">
              iPXE BOOT MANAGER
            </span>
          </div>
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Server className="h-4 w-4 mr-2" />
              Hosts
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/profiles">
              <Network className="h-4 w-4 mr-2" />
              Profiles
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/isos">
              <Disc3 className="h-4 w-4 mr-2" />
              ISOs
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tftp">
              <Folder className="h-4 w-4 mr-2" />
              TFTP
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/terminal">
              <Terminal className="h-4 w-4 mr-2" />
              Terminal
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
