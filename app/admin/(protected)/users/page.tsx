
'use client';

import { useState, useEffect } from "react";
import { getUsers, addUser, deleteUser, updateUser } from "@/services/hotel-service";
import type { User, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, UserPlus, ShieldCheck, User as UserIcon, Loader2, Trash2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    const loadUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    useEffect(() => { loadUsers(); }, []);

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            await new Promise(r => setTimeout(r, 800)); // Spinner simulation
            await addUser({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as UserRole,
                password: formData.get('password') as string,
            });
            await loadUsers();
            setIsAddOpen(false);
            toast({ title: "User Created", description: "Successfully added new system user." });
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to create user" });
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
                        <Input 
                            placeholder="Search users..." 
                            className="w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={() => setIsAddOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <span className="font-bold">{u.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> {u.email}
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
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                disabled={u.email === 'admin@wamaghach.com'} // Protect master admin
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Register New System User</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" placeholder="e.g. John Doe" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input name="email" type="email" placeholder="john@wamaghach.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Access Role</Label>
                                <Select name="role" defaultValue="staff">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                                        <SelectItem value="staff">Operational Staff (POS Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Initial Access Key (Password)</Label>
                            <Input name="password" type="password" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
