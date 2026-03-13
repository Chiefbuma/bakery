
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Package, Settings, Star, LogOut, Menu, X, Utensils, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn && pathname !== '/admin/login') {
      router.replace('/admin/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (isCheckingAuth) return null;

  const navItems = [
    { label: 'Dashboard', href: '/admin/portal/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/portal/orders', icon: ShoppingBag },
    { label: 'Cakes', href: '/admin/portal/cakes', icon: Package },
    { label: 'Customizations', href: '/admin/portal/customizations', icon: Settings },
    { label: 'Special Offers', href: '/admin/offers', icon: Star },
    { label: 'Staff Directory', href: '/admin/portal/users', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-white transition-transform duration-300 transform lg:translate-x-0 lg:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black font-headline text-primary">Artisan Portal</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-3 h-12 text-sm font-bold",
                    pathname === item.href 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "text-stone-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <Separator className="my-6 bg-white/10" />

          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-stone-400 hover:text-destructive hover:bg-destructive/10 font-bold" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest hidden md:block">
            {navItems.find(i => i.href === pathname)?.label || 'WhiskeDelights Panel'}
          </div>
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm" className="font-bold border-primary text-primary hover:bg-primary/5">Storefront</Button>
          </Link>
        </header>
        
        <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
