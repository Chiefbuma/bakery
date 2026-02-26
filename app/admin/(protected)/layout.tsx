
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Hotel, Package, LogOut, Home, Loader2, CreditCard } from "lucide-react";
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

  // Auto-collapse sidebar on POS terminal for full width experience
  const isPOS = pathname === '/admin/pos';

  useEffect(() => {
    setIsCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    router.push('/admin/login');
  };

  if (isCheckingAuth) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isPOS}>
      <div className="flex min-h-screen bg-muted/40 w-full">
        {!isPOS && (
          <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
            <SidebarHeader className="h-14 flex items-center justify-center">
               <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                  <Hotel className="h-6 w-6" />
                  <span className="group-data-[collapsible=icon]:hidden">Wamaghach</span>
               </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="P&L Dashboard" isActive={pathname === '/admin/dashboard'}>
                      <Link href="/admin/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="POS Terminal" isActive={pathname === '/admin/pos'}>
                      <Link href="/admin/pos"><CreditCard /><span>POS Terminal</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Inventory" isActive={pathname === '/admin/inventory'}>
                      <Link href="/admin/inventory"><Package /><span>Inventory</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Back to Shop">
                          <Link href="/"><Home /><span>Front Desk</span></Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                          <LogOut /><span>Logout</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}
        <main className="flex-1 flex flex-col min-w-0">
           <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                {!isPOS && <SidebarTrigger className="md:hidden" />}
                {isPOS && (
                   <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-primary mr-4">
                      <Hotel className="h-5 w-5" />
                      <span>Wamaghach</span>
                   </Link>
                )}
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">{isPOS ? 'POS Terminal' : 'Management System'}</h1>
                </div>
                <div className="flex items-center gap-4">
                  {isPOS && (
                    <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary hidden sm:block">
                      Exit POS
                    </Link>
                  )}
                  <Avatar>
                      <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="@admin" />
                      <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </div>
           </header>
          <div className={cn("flex-1 overflow-auto", isPOS ? "p-0" : "p-4 md:p-6")}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
