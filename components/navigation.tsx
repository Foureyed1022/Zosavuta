'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, TicketIcon, LogOutIcon, ChevronRight } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'customer' | 'organizer' | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // Use a timeout or handle the case where Firestore might be offline
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          setUserRole('customer');
        }
      } catch (error: any) {
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.warn('Firestore is offline, using default role.');
        } else {
          console.error('Error fetching role:', error);
        }
        setUserRole('customer');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (pathname === '/auth') return null;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Explore' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/organizer', label: 'Sell Tickets' },
    { href: '/support', label: 'Help' },
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image src="/zosavuta.png" alt="Zosavuta" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-foreground leading-none">ZOSAVUTA</span>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase leading-none mt-0.5">Tickets MW</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-all text-sm font-bold uppercase tracking-widest relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-6">
            {loading ? (
              <div className="w-24 h-9 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground">Hello, <span className="text-primary">{user.displayName?.split(' ')[0] || 'Member'}</span></span>
                <Link href="/my-bookings">
                  <Button variant="ghost" size="sm" className="font-bold uppercase tracking-tighter text-xs hover:bg-primary/5 hover:text-primary">
                    My Tickets
                  </Button>
                </Link>
                
                {userRole === 'organizer' ? (
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="font-bold uppercase tracking-widest text-xs px-4 rounded-full">
                        Attendee Hub
                      </Button>
                    </Link>
                    <Link href="/organizer/dashboard">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs px-6 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        Organizer Hub
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/dashboard">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs px-6 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                      Dashboard
                    </Button>
                  </Link>
                )}
                
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive transition-colors">
                  <LogOutIcon className="w-5 h-5" />
                </Button>
                <ModeToggle />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth">
                  <Button variant="ghost" className="font-bold uppercase tracking-widest text-xs hover:bg-primary/5 hover:text-primary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-xs px-6 rounded-full transition-all hover:scale-105">
                    Join Free
                  </Button>
                </Link>
                <ModeToggle />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                <MenuIcon className="w-6 h-6 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] border-l-0 p-0">
              <div className="flex flex-col h-full bg-background">
                <SheetHeader className="p-6 border-b border-border/50 flex items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-primary/10">
                      <Image src="/zosavuta.png" alt="Zosavuta" fill className="object-cover" />
                    </div>
                    <SheetTitle className="font-black text-lg tracking-tighter">ZOSAVUTA</SheetTitle>
                    <SheetDescription className="sr-only">Mobile Navigation Menu</SheetDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModeToggle />
                    {user && (
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logged in as</p>
                        <p className="text-sm font-bold text-primary">{user.displayName || 'Member'}</p>
                      </div>
                    )}
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main Menu</p>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all group"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="font-bold uppercase tracking-widest text-sm">{link.label}</span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account</p>
                    {loading ? (
                      <div className="space-y-3">
                        <div className="w-full h-14 bg-muted animate-pulse rounded-2xl" />
                      </div>
                    ) : user ? (
                      <div className="space-y-3">
                        <Link href="/my-bookings" className="block" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-sm justify-between px-6">
                            My Tickets
                            <TicketIcon className="w-5 h-5 text-primary" />
                          </Button>
                        </Link>
                        
                        {userRole === 'organizer' ? (
                          <>
                            <Link href="/dashboard" className="block" onClick={() => setIsOpen(false)}>
                              <Button variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-sm border-primary/20 hover:bg-primary/5">
                                Attendee Dashboard
                              </Button>
                            </Link>
                            <Link href="/organizer/dashboard" className="block" onClick={() => setIsOpen(false)}>
                              <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20">
                                Organizer Dashboard
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <Link href="/dashboard" className="block" onClick={() => setIsOpen(false)}>
                            <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20">
                              Dashboard
                            </Button>
                          </Link>
                        )}

                        <Button 
                          variant="ghost" 
                          className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-sm text-destructive hover:bg-destructive/5 hover:text-destructive"
                          onClick={() => {
                            handleSignOut();
                            setIsOpen(false);
                          }}
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/auth" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/auth" onClick={() => setIsOpen(false)}>
                          <Button className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs">
                            Join Free
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 bg-card border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground font-medium italic">Discover amazing events in Malawi</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

