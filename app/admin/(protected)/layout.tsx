
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hotel, Package, LogOut, Loader2, CreditCard, Receipt, LayoutDashboard, Users } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const userStr = localStorage.getItem('adminUser');
    
    if (!isLoggedIn || !userStr) {
      router.replace('/');
    } else {
      const user = JSON.parse(userStr);
      setUserRole(user.role);
      setUserName(user.name);
      
      const adminOnlyRoutes = ['/admin/dashboard', '/admin/inventory', '/admin/expenses', '/admin/users'];
      if (user.role !== 'admin' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
        router.replace('/admin/pos');
      }
      
      setIsCheckingAuth(false);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-950"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const allNavItems = [
    { label: 'POS Terminal', href: '/admin/pos', icon: CreditCard, roles: ['admin', 'staff'] },
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'Inventory', href: '/admin/inventory', icon: Package, roles: ['admin'] },
    { label: 'Expenses', href: '/admin/expenses', icon: Receipt, roles: ['admin'] },
    { label: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
  ];

  const visibleNavItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <div className="flex min-h-screen bg-muted/40 w-full flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-background px-6 sticky top-0 z-50">
        <Link href="/admin/pos" className="flex items-center gap-2 font-bold text-lg text-primary mr-8">
          <Hotel className="h-6 w-6" />
          <span className="hidden md:inline font-headline tracking-tight">Wamaghach</span>
        </Link>

        <nav className="flex-1 flex items-center gap-1 md:gap-2">
          {visibleNavItems.map((item) => (
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
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-foreground">{userName}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{userRole}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-5 w-5" />
          </Button>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${userName}`} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
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
