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
                toast({ title: "User Updated" });
            } else {
                await addUser({
                    ...data,
                    password: data.password || 'staff123',
                });
                toast({ title: "User Created" });
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
        <div className="space-y-3">
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight">Personnel Directory</h1>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Manage system credentials.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b py-2.5">
                    <div className="space-y-0.5">
                        <CardTitle className="text-[11px] font-bold uppercase">Staff Management</CardTitle>
                        <CardDescription className="text-[8px] font-bold uppercase">Authorized Access</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-40">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Search..." className="h-7 pl-8 text-[10px]" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <Button size="sm" className="h-7 text-[9px] font-bold uppercase" onClick={() => handleOpenDialog()}>
                            <UserPlus className="mr-1 h-3 w-3" /> Add User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 h-7">
                                <TableHead className="text-[9px] font-black uppercase">Staff Profile</TableHead>
                                <TableHead className="text-[9px] font-black uppercase">Role</TableHead>
                                <TableHead className="text-right text-[9px] font-black uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={3} className="h-10 animate-pulse bg-muted/10" /></TableRow>)
                            ) : paginatedUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-20 text-center text-muted-foreground text-[9px] font-bold uppercase italic">No personnel found.</TableCell></TableRow>
                            ) : paginatedUsers.map((u) => (
                                <TableRow key={u.id} className="h-10">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[10px]">{u.name}</span>
                                            <span className="text-[8px] text-muted-foreground">{u.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize text-[8px] h-3.5 px-1.5">
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-0.5">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => handleOpenDialog(u)}><Edit className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" disabled={u.email === 'admin@wamaghach.com'} onClick={() => { setTargetUser({id: u.id, name: u.name}); setDeleteConfirmOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/10">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Page {currentPage} of {totalPages || 1}</span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-3 w-3" /></Button>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-3 w-3" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden">
                    <DialogHeader className="p-3 border-b bg-muted/10">
                        <DialogTitle className="text-[11px] font-bold uppercase">{editingUser ? 'Update Profile' : 'Register User'}</DialogTitle>
                        <DialogDescription className="text-[8px] font-bold uppercase">Staff access credentials.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="p-3 space-y-2">
                        <div className="space-y-0.5">
                            <Label className="text-[9px] font-bold uppercase">Full Name</Label>
                            <input {...register('name', { required: true })} disabled={isSubmitting} placeholder="e.g. John Doe" className="flex h-7 w-full rounded-md border border-input bg-background px-3 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-[9px] font-bold uppercase">Email Address</Label>
                            <input type="email" {...register('email', { required: true })} disabled={isSubmitting} className="flex h-7 w-full rounded-md border border-input bg-background px-3 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-[9px] font-bold uppercase">Role</Label>
                            <Select value={editingUser?.role || 'staff'} onValueChange={(v) => setValue('role', v as UserRole)}>
                                <SelectTrigger className="h-7 text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="staff">Standard Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {!editingUser && (
                            <div className="space-y-0.5">
                                <Label className="text-[9px] font-bold uppercase">Access Key</Label>
                                <input type="password" placeholder="••••••••" {...register('password')} disabled={isSubmitting} className="flex h-7 w-full rounded-md border border-input bg-background px-3 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                            </div>
                        )}
                        <DialogFooter className="pt-2 gap-1.5">
                            <Button variant="outline" size="sm" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="h-7 text-[9px] font-bold">CANCEL</Button>
                            <Button size="sm" type="submit" disabled={isSubmitting} className="flex-1 text-[9px] font-bold uppercase">
                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold uppercase">Delete User?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">Revoke all system access for this account immediately?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="text-[10px] font-bold uppercase h-8" onClick={() => setDeleteConfirmOpen(false)}>CANCEL</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-white text-[10px] font-bold uppercase h-8 hover:bg-destructive/90">REVOKE ACCESS</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}