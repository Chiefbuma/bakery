
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Hotel, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUsers } from '@/services/hotel-service';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn) {
      router.replace('/admin/pos');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Check against mock users
    setTimeout(async () => {
        const users = await getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            localStorage.setItem('adminUser', JSON.stringify({ 
              name: user.name, 
              email: user.email,
              role: user.role 
            }));
            
            toast({
                title: 'Login Successful',
                description: `Welcome to Wamaghach Management System, ${user.name}.`,
            });
            
            router.push('/admin/pos');
        } else {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'Invalid credentials. Please contact your administrator.',
            });
            setIsLoggingIn(false);
        }
    }, 1500);
  };

  if (isCheckingAuth) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-950">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
          alt="Hotel Interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin}>
            <CardHeader className="text-center space-y-4">
                <div className="flex items-center gap-3 justify-center text-primary mb-2">
                    <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                        <Hotel className="h-8 w-8" />
                    </div>
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-3xl font-black tracking-tight text-white font-headline">Wamaghach</CardTitle>
                    <CardDescription className="text-stone-400 font-medium uppercase tracking-widest text-[10px]">Kahua-ini Hotel Management</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-300">Staff Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="admin@wamaghach.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    className="bg-white/5 border-white/10 text-white placeholder:text-stone-600 focus:border-primary focus:ring-primary"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-300">Access Key</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    className="bg-white/5 border-white/10 text-white placeholder:text-stone-600 focus:border-primary focus:ring-primary"
                />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={isLoggingIn}>
                {isLoggingIn ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Authenticating...</> : <><Lock className="mr-2 h-4 w-4" /> Secure Login</>}
                </Button>
                <p className="text-center text-[10px] text-stone-500 italic">
                    Authorized Personnel Only. All access is logged.
                </p>
            </CardFooter>
            </form>
        </Card>
      </motion.div>
    </div>
  );
}
