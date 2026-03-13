'use client';

import { useState, useEffect, useMemo } from "react";
import type { User, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, Trash2, Edit, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

// Mock User Data for Bakery
const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin Master', email: 'admin@whiskedelights.com', role: 'admin', createdAt: new Date().toISOString() },
  { id: '2', name: 'Jane Baker', email: 'jane@whiskedelights.com', role: 'staff', createdAt: new Date().toISOString() },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5; // Strict 5 record pagination

    const { toast } = useToast();

    const filteredUsers = useMemo(() => 
        users.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [users, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleDelete = (id: string) => {
        if (users.find(u => u.id === id)?.email === 'admin@whiskedelights.com') {
            toast({ variant: "destructive", title: "Action Restricted", description: "Main admin cannot be deleted." });
            return;
        }
        setUsers(users.filter(u => u.id !== id));
        toast({ title: "Personnel Removed", description: "Access has been revoked." });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black font-headline tracking-tight">Staff Directory</h1>
                    <p className="text-muted-foreground font-medium">Control corporate access and management privileges.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20">
                    <UserPlus className="h-5 w-5" />
                    Register Personnel
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-stone-900 text-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Active Accounts (5 per page)
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                            <Input 
                              placeholder="Find personnel..." 
                              className="h-8 pl-9 bg-white/10 border-white/20 text-white placeholder:text-stone-500 text-xs rounded-lg" 
                              value={searchQuery} 
                              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-stone-50 border-none">
                                <TableHead className="font-black text-[10px] uppercase">Staff Profile</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Authority</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Registered</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">No personnel records found.</TableCell></TableRow>
                            ) : paginatedUsers.map((u) => (
                                <TableRow key={u.id} className="hover:bg-stone-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{u.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize text-[10px] font-black">
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-medium">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="text-primary h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="p-4 border-t flex items-center justify-between bg-stone-50/50">
                        <span className="text-xs font-bold text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl font-black">Register Personnel</DialogTitle>
                        <DialogDescription>Add a new master baker or administrator to the corporate portal.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                            <Input placeholder="John Doe" className="h-12 border-2 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Corporate Email</Label>
                            <Input type="email" placeholder="john@whiskedelights.com" className="h-12 border-2 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authority Level</Label>
                            <Select defaultValue="staff">
                                <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="staff">Staff Member</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="pt-6">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl">Cancel</Button>
                        <Button className="h-12 rounded-xl px-8 font-black" onClick={() => { setIsDialogOpen(false); toast({ title: "Staff Created" }); }}>Save Profile</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
