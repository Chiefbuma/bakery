'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Package, Settings, Star, LogOut, Menu, X, Utensils, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed by default on mobile
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn && pathname !== '/admin/login') {
      router.replace('/admin/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [pathname, router]);

  // Handle desktop auto-open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-white transition-transform duration-300 transform lg:static lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black font-headline text-primary">Artisan</span>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden text-stone-400" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-3 h-11 text-[11px] font-black uppercase tracking-wider",
                    pathname === item.href 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "text-stone-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <Separator className="my-6 bg-white/5" />

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-11 text-[11px] text-stone-400 hover:text-destructive hover:bg-destructive/10 font-black uppercase tracking-wider" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {isLoggingOut ? 'Leaving...' : 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hidden sm:block">
              {navItems.find(i => i.href === pathname)?.label || 'Artisan Portal'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="text-[10px] font-black h-9 border-stone-200 uppercase tracking-widest px-4">Storefront</Button>
            </Link>
          </div>
        </header>
        
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}