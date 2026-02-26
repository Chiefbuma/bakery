
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, ShoppingCart, Hotel, Package, LogOut, Home, Loader2, CreditCard } from "lucide-react";
import Link from 'next/link';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // In prototype, we skip real auth check
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
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
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
        <main className="flex-1 flex flex-col">
           <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">Management System</h1>
                </div>
                <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="@admin" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
           </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
