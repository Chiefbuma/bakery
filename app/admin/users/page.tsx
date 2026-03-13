'use client';

import { useState, useEffect, useMemo } from "react";
import { getUsers, addUser, deleteUser, updateUser } from "@/services/hotel-service";
import type { User, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, Trash2, Edit, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
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
import { motion } from "framer-motion";

export default function AdminUsersPage() {
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

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Load Failed" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

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
            loadUsers();
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
            loadUsers();
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-headline tracking-tight">Personnel Directory</h1>
                    <p className="text-muted-foreground font-medium">Manage system credentials and authorized access.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20">
                    <UserPlus className="h-5 w-5" />
                    Register Staff
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-stone-900 text-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Staff Accounts (5 per page)
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                            <Input 
                              placeholder="Search staff..." 
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
                                <TableHead className="font-black text-[10px] uppercase">Role</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Registered</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="h-16 animate-pulse bg-muted/10" /></TableRow>)
                            ) : paginatedUsers.length === 0 ? (
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
                                            <Button variant="ghost" size="icon" className="text-primary h-8 w-8" onClick={() => handleOpenDialog(u)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" disabled={u.email === 'admin@whiskedelights.com'} onClick={() => { setTargetUser({id: u.id, name: u.name}); setDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl font-black">{editingUser ? 'Update Staff Profile' : 'Register New Staff'}</DialogTitle>
                        <DialogDescription className="font-medium">Set access credentials and authority level.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="font-black text-xs uppercase tracking-widest text-stone-500">Full Name</Label>
                            <Input {...register('name', { required: true })} disabled={isSubmitting} placeholder="e.g. John Doe" className="h-12 border-2 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-xs uppercase tracking-widest text-stone-500">Email Address</Label>
                            <Input type="email" {...register('email', { required: true })} disabled={isSubmitting} className="h-12 border-2 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-xs uppercase tracking-widest text-stone-500">Role</Label>
                            <Select value={editingUser?.role || 'staff'} onValueChange={(v) => setValue('role', v as UserRole)}>
                                <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="staff">Standard Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {!editingUser && (
                            <div className="space-y-2">
                                <Label className="font-black text-xs uppercase tracking-widest text-stone-500">Initial Access Key</Label>
                                <Input type="password" placeholder="Leave empty for default" {...register('password')} disabled={isSubmitting} className="h-12 border-2 rounded-xl" />
                            </div>
                        )}
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="h-12 rounded-xl">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl gap-2 px-8 font-black">
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Personnel
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-2xl font-black">Revoke Access?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium">This will immediately revoke all system access for {targetUser?.name}. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)} className="rounded-xl">Keep User</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-black">Revoke Access</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}