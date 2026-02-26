
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Hotel, Package, LogOut, Loader2, CreditCard, Receipt } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setIsCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    router.push('/admin/login');
  };

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const navItems = [
    { label: 'POS Terminal', href: '/admin/pos', icon: CreditCard },
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', href: '/admin/inventory', icon: Package },
    { label: 'Expenses', href: '/admin/expenses', icon: Receipt },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40 w-full flex-col">
      {/* Horizontal Header Navigation */}
      <header className="flex h-16 items-center gap-4 border-b bg-background px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mr-8">
          <Hotel className="h-6 w-6" />
          <span className="hidden md:inline">Wamaghach</span>
        </Link>

        <nav className="flex-1 flex items-center gap-1 md:gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={pathname === item.href ? "secondary" : "ghost"} 
                className={cn(
                  "gap-2 h-10 px-3 md:px-4 text-sm font-semibold",
                  pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-5 w-5" />
          </Button>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className={cn("flex-1", pathname === '/admin/pos' ? "p-0" : "p-4 md:p-8 container mx-auto")}>
          {children}
        </div>
      </main>
    </div>
  );
}
