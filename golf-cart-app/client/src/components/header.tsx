import { Link, useLocation } from 'wouter';
import { MapPin, Car, Wrench, FileText, ShoppingCart, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { href: '/', label: 'Home', icon: null },
    { href: '/gps', label: 'GPS Navigation', icon: MapPin },
    { href: '/brands', label: 'Golf Carts', icon: Car },
    { href: '/wiring', label: 'Wiring Diagrams', icon: FileText },
    { href: '/parts', label: 'Parts', icon: Wrench },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center space-x-2 mr-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="h-6 w-6" />
            </div>
            <span className="hidden font-bold text-xl sm:inline-block">
              GolfCartly
            </span>
          </a>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search carts, parts..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Mobile menu button - simplified for now */}
        <Button variant="ghost" size="icon" className="md:hidden ml-auto">
          <Car className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
