
'use client';

import { useState, useEffect } from "react";
import { getUsers, addUser, deleteUser, deleteUsers, updateUser } from "@/services/hotel-service";
import type { User, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, ShieldCheck, User as UserIcon, Loader2, Trash2, Mail, MoreHorizontal, Edit, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();

    const loadUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    useEffect(() => { loadUsers(); }, []);

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
            await new Promise(r => setTimeout(r, 800)); // Spinner simulation
            if (editingUser) {
                await updateUser(editingUser.id, userData);
                toast({ title: "User Updated", description: "Successfully updated system user details." });
            } else {
                await addUser({
                    ...userData,
                    password: formData.get('password') as string || 'staff123',
                });
                toast({ title: "User Created", description: "Successfully added new system user." });
            }
            await loadUsers();
            setIsAddOpen(false);
            setEditingUser(null);
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed", description: "Could not save user changes." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await deleteUser(id);
            await loadUsers();
            toast({ title: "User Removed" });
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedUsers.size} selected user(s)?`)) return;
        
        try {
            await deleteUsers(Array.from(selectedUsers));
            setSelectedUsers(new Set());
            await loadUsers();
            toast({ title: "Users Deleted", description: "Selected accounts have been removed." });
        } catch (error) {
            toast({ variant: "destructive", title: "Bulk Deletion Failed" });
        }
    };

    const toggleSelectUser = (id: string) => {
        const next = new Set(selectedUsers);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedUsers(next);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setIsAddOpen(true);
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedUsers.size})
                            </Button>
                        )}
                        <Input 
                            placeholder="Search users..." 
                            className="w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                                            checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                                            onCheckedChange={toggleSelectAll}
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
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.map((u) => (
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
                                            <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {u.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {u.role === 'admin' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <UserIcon className="h-3 w-3 mr-1" />}
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
                                                    <DropdownMenuItem onClick={() => openEditDialog(u)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:text-destructive" 
                                                        onClick={() => handleDeleteUser(u.id, u.name)}
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
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if(!open) setEditingUser(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User Details' : 'Register New System User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? `Update permissions and profile for ${editingUser.name}.` : 'Set up a new account for hotel personnel.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" defaultValue={editingUser?.name} placeholder="e.g. John Doe" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input name="email" type="email" defaultValue={editingUser?.email} placeholder="john@wamaghach.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Access Role</Label>
                                <Select name="role" defaultValue={editingUser?.role || "staff"}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                                        <SelectItem value="staff">Operational Staff (POS Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {!editingUser && (
                            <div className="space-y-2">
                                <Label>Initial Access Key (Password)</Label>
                                <Input name="password" type="password" placeholder="••••••••" required />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingUser ? "Save Changes" : "Create Account")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
