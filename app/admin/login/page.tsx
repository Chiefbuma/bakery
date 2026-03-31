
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/services/cake-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginAdmin({ email, password });
      toast({ title: "Welcome back!", description: "Access granted." });
      router.push('/admin/portal/dashboard');
    } catch (err) {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 bg-primary rounded-[2rem] items-center justify-center shadow-2xl shadow-primary/30 mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black font-headline tracking-tight">Artisan Portal</h1>
          <p className="text-muted-foreground font-medium">Bakery Management System Access</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest">Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 border-2" required />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest">Access Key</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 border-2" required />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-black gap-2 shadow-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Enter Portal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
