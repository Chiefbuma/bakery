
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsers, addUser, deleteUser, updateUser } from "@/services/hotel-service";
import type { User, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, Trash2, Edit, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export const dynamic = 'force-dynamic';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<{id: string, name: string} | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue } = useForm<{
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

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            reset({
                name: user.name,
                email: user.email,
                role: user.role,
                password: ''
            });
        } else {
            setEditingUser(null);
            reset({
                name: '',
                email: '',
                role: 'staff',
                password: ''
            });
        }
        setIsDialogOpen(true);
    };

    const onFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id, data);
                toast({ title: "User Updated", description: `${data.name}'s profile has been updated.` });
            } else {
                await addUser({
                    ...data,
                    password: data.password || 'staff123',
                });
                toast({ title: "User Created", description: "Account is ready for use." });
            }
            setIsDialogOpen(false);
            setEditingUser(null);
            setTimeout(() => { loadUsers(); }, 100);
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
            await loadUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setDeleteConfirmOpen(false);
            setTargetUser(null);
        }
    };

    const filteredUsers = useMemo(() => 
        users.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [users, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Personnel Directory</h1>
                <p className="text-muted-foreground">Manage system access roles and credentials.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <div className="space-y-1">
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View and manage authorized hotel staff.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search personnel..." 
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <Button onClick={() => handleOpenDialog()}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>User Profile</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}><TableCell colSpan={4} className="h-12 animate-pulse bg-muted/10" /></TableRow>
                                    ))
                                ) : paginatedUsers.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No personnel found.</TableCell></TableRow>
                                ) : paginatedUsers.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{u.name}</span>
                                                <span className="text-[11px] text-muted-foreground">{u.email}</span>
                                            </div>
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
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenDialog(u)}><Edit className="h-4 w-4" /></Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-destructive"
                                                    disabled={u.email === 'admin@wamaghach.com'}
                                                    onClick={() => { setTargetUser({id: u.id, name: u.name}); setDeleteConfirmOpen(true); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Update Profile' : 'Register New User'}</DialogTitle>
                        <DialogDescription>Enter account details for system access.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <input {...register('name', { required: true })} disabled={isSubmitting} placeholder="e.g. John Doe" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <input type="email" {...register('email', { required: true })} disabled={isSubmitting} placeholder="john@wamaghach.com" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                            </div>
                            <div className="space-y-2">
                                <Label>System Role</Label>
                                <Select value={editingUser?.role || 'staff'} onValueChange={(v) => setValue('role', v as UserRole)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="staff">Standard Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {!editingUser && (
                            <div className="space-y-2">
                                <Label>Initial Access Key</Label>
                                <input type="password" placeholder="••••••••" {...register('password')} disabled={isSubmitting} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                            </div>
                        )}
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (editingUser ? "Save Changes" : "Create Account")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently delete user?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-white">Delete Account</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
