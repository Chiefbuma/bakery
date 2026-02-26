
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Hotel, Package, LogOut, Home, Loader2, CreditCard, Receipt } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isPOS = pathname === '/admin/pos';

  useEffect(() => {
    setIsCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    router.push('/admin/login');
  };

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <SidebarProvider defaultOpen={!isPOS}>
      <div className="flex min-h-screen bg-muted/40 w-full">
        {!isPOS && (
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="h-14 flex items-center justify-center">
               <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                  <Hotel className="h-6 w-6" />
                  <span className="group-data-[collapsible=icon]:hidden">Wamaghach</span>
               </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                   <SidebarMenuButton asChild isActive={pathname === '/admin/dashboard'}>
                      <Link href="/admin/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/admin/pos'}>
                      <Link href="/admin/pos"><CreditCard /><span>POS Terminal</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/admin/inventory'}>
                      <Link href="/admin/inventory"><Package /><span>Inventory</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/admin/expenses'}>
                      <Link href="/admin/expenses"><Receipt /><span>Expenses</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Logout" onClick={handleLogout}><LogOut /><span>Logout</span></SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}
        <main className="flex-1 flex flex-col min-w-0">
           <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                {!isPOS && <SidebarTrigger className="md:hidden" />}
                <div className="flex-1"><h1 className="text-lg font-semibold">{isPOS ? 'POS Terminal' : 'Wamaghach Executive'}</h1></div>
                <Avatar><AvatarImage src="https://i.pravatar.cc/150?u=admin" /><AvatarFallback>A</AvatarFallback></Avatar>
           </header>
          <div className={cn("flex-1 overflow-auto", isPOS ? "p-0" : "p-4 md:p-6")}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
