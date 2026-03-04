
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsers, addUser, deleteUser, deleteUsers, updateUser } from "@/services/hotel-service";
import type { User, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, Trash2, Mail, MoreHorizontal, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
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
import { useForm } from "react-hook-form";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<{id: string, name: string} | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue, watch } = useForm<{
        name: string;
        email: string;
        role: UserRole;
        password?: string;
    }>();

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Load Failed" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    useEffect(() => {
        if (editingUser) {
            setValue('name', editingUser.name);
            setValue('email', editingUser.email);
            setValue('role', editingUser.role);
        } else {
            reset({ name: '', email: '', role: 'staff', password: '' });
        }
    }, [editingUser, setValue, reset]);

    const onFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id, data);
                toast({ title: "User Updated" });
            } else {
                await addUser({
                    ...data,
                    password: data.password || 'staff123',
                });
                toast({ title: "User Created" });
            }
            setIsAddOpen(false);
            setEditingUser(null);
            await loadUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Operation Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!targetUser) return;
        try {
            await deleteUser(targetUser.id);
            toast({ title: "User Removed" });
            setSelectedUsers(prev => {
                const next = new Set(prev);
                next.delete(targetUser.id);
                return next;
            });
            await loadUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setDeleteConfirmOpen(false);
            setTargetUser(null);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await deleteUsers(Array.from(selectedUsers));
            toast({ title: "Users Deleted" });
            setSelectedUsers(new Set());
            await loadUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Bulk Deletion Failed" });
        } finally {
            setBulkDeleteConfirmOpen(false);
        }
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Personnel Directory</h1>
                <p className="text-muted-foreground">Manage system access roles and credentials.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View and manage authorized hotel staff.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
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
                    <AnimatePresence mode="wait">
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox 
                                                checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.has(u.id))}
                                                onCheckedChange={(checked) => {
                                                    const next = new Set(selectedUsers);
                                                    if (checked) paginatedUsers.forEach(u => next.add(u.id));
                                                    else paginatedUsers.forEach(u => next.delete(u.id));
                                                    setSelectedUsers(next);
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}><TableCell colSpan={5} className="h-16 animate-pulse bg-muted/20" /></TableRow>
                                        ))
                                    ) : paginatedUsers.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No records found.</TableCell></TableRow>
                                    ) : paginatedUsers.map((u) => (
                                        <TableRow key={u.id} className={selectedUsers.has(u.id) ? "bg-muted/50" : ""}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedUsers.has(u.id)}
                                                    onCheckedChange={(checked) => {
                                                        const next = new Set(selectedUsers);
                                                        if (checked) next.add(u.id); else next.delete(u.id);
                                                        setSelectedUsers(next);
                                                    }}
                                                    disabled={u.email === 'admin@wamaghach.com'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{u.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{u.role}</Badge></TableCell>
                                            <TableCell className="text-xs">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setEditingUser(u); setIsAddOpen(true); }}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-destructive" 
                                                            onClick={() => { setTargetUser({id: u.id, name: u.name}); setDeleteConfirmOpen(true); }}
                                                            disabled={u.email === 'admin@wamaghach.com'}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </AnimatePresence>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex-1">
                            {selectedUsers.size > 0 && (
                                <Button variant="destructive" size="sm" onClick={() => setBulkDeleteConfirmOpen(true)}>
                                    Delete Selected ({selectedUsers.size})
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={(open) => { if(!isSubmitting) setIsAddOpen(open); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Update User' : 'Register New User'}</DialogTitle>
                        <DialogDescription>Enter account details for system access.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input {...register('name', { required: true })} disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" {...register('email', { required: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select defaultValue="staff" onValueChange={(v) => setValue('role', v as UserRole)}>
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
                                <Label>Password</Label>
                                <Input type="password" placeholder="Initial access key" {...register('password')} disabled={isSubmitting} />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                {editingUser ? "Apply Changes" : "Create Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently delete user?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove all access for {targetUser?.name}. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90 text-white">Delete Account</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedUsers.size} users?</AlertDialogTitle>
                        <AlertDialogDescription>The selected personnel will lose system access immediately.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90 text-white">Confirm Removal</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
