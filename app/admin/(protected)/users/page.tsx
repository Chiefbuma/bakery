
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsers, addUser, deleteUser, deleteUsers, updateUser } from "@/services/hotel-service";
import type { User, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, ShieldCheck, User as UserIcon, Loader2, Trash2, Mail, MoreHorizontal, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => Promise<void>;
    } | null>(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const { toast } = useToast();

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Load Failed", description: "Could not retrieve user directory." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const userData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as UserRole,
        };

        try {
            if (editingUser) {
                await updateUser(editingUser.id, userData);
                toast({ title: "User Updated" });
            } else {
                await addUser({
                    ...userData,
                    password: formData.get('password') as string || 'staff123',
                });
                toast({ title: "User Created" });
            }
            setIsAddOpen(false);
            setEditingUser(null);
            await loadUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteUser = (id: string, name: string) => {
        setConfirmConfig({
            isOpen: true,
            title: `Delete Account: ${name}?`,
            description: "This will permanently remove this user's access to the management system.",
            onConfirm: async () => {
                try {
                    await deleteUser(id);
                    toast({ title: "User Removed" });
                    setSelectedUsers(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                    await loadUsers();
                } catch (error) {
                    toast({ variant: "destructive", title: "Action Failed" });
                } finally {
                    setConfirmConfig(null);
                }
            }
        });
    };

    const confirmBulkDelete = () => {
        if (selectedUsers.size === 0) return;
        setConfirmConfig({
            isOpen: true,
            title: `Remove ${selectedUsers.size} Users?`,
            description: "The selected personnel will lose all system access immediately.",
            onConfirm: async () => {
                try {
                    await deleteUsers(Array.from(selectedUsers));
                    toast({ title: "Users Deleted" });
                    setSelectedUsers(new Set());
                    await loadUsers();
                } catch (error) {
                    toast({ variant: "destructive", title: "Bulk Deletion Failed" });
                } finally {
                    setConfirmConfig(null);
                }
            }
        });
    };

    const filteredUsers = useMemo(() => 
        users.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [users, searchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const toggleSelectUser = (id: string) => {
        setSelectedUsers(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">System User Management</h1>
                <p className="text-muted-foreground">Manage access roles for administrative and operational staff.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>User Directory</CardTitle>
                        <CardDescription>Authorized users with system access.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedUsers.size > 0 && (
                            <Button variant="destructive" size="sm" onClick={confirmBulkDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedUsers.size})
                            </Button>
                        )}
                        <Input 
                            placeholder="Search users..." 
                            className="w-64"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                        <Button onClick={() => { setEditingUser(null); setIsAddOpen(true); }}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox 
                                            checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.has(u.id))}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    const next = new Set(selectedUsers);
                                                    paginatedUsers.forEach(u => next.add(u.id));
                                                    setSelectedUsers(next);
                                                } else {
                                                    const next = new Set(selectedUsers);
                                                    paginatedUsers.forEach(u => next.delete(u.id));
                                                    setSelectedUsers(next);
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6}><div className="h-8 animate-pulse bg-muted rounded w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : paginatedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedUsers.map((u) => (
                                    <TableRow key={u.id} className={selectedUsers.has(u.id) ? "bg-muted/50" : ""}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedUsers.has(u.id)}
                                                onCheckedChange={() => toggleSelectUser(u.id)}
                                                disabled={u.email === 'admin@wamaghach.com'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <span className="font-bold">{u.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-2 text-xs"><Mail className="h-3 w-3" /> {u.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { setEditingUser(u); setIsAddOpen(true); }}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-destructive" 
                                                        onClick={() => confirmDeleteUser(u.id, u.name)}
                                                        disabled={u.email === 'admin@wamaghach.com'}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={(open) => { if (!isSubmitting) setIsAddOpen(open); if(!open && !isSubmitting) setEditingUser(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Register User'}</DialogTitle>
                        <DialogDescription>Hotel personnel management.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" defaultValue={editingUser?.name} placeholder="e.g. John Doe" required disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input name="email" type="email" defaultValue={editingUser?.email} required disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select name="role" defaultValue={editingUser?.role || "staff"} disabled={isSubmitting}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {!editingUser && (
                            <div className="space-y-2">
                                <Label>Initial Password</Label>
                                <Input name="password" type="password" placeholder="••••••••" required disabled={isSubmitting} />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                {editingUser ? "Save Changes" : "Create Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!confirmConfig} onOpenChange={(open) => { if (!open) setConfirmConfig(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmConfig?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmConfig?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmConfig?.onConfirm} className="bg-destructive hover:bg-destructive/90">
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
