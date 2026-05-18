'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CalendarIcon, MapPinIcon, Crown, Sparkles, ShieldCheck, User, Star, TagIcon, InfoIcon, TicketIcon } from 'lucide-react';
import { DEMO_BOOKINGS, DEMO_EVENTS } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { doc, updateDoc, setDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventVenue: string;
  eventImage: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'confirmed' | 'used' | 'refunded' | 'pending';
  bookingDate: string;
  ticketNumbers: string[];
  isListed?: boolean;
  resalePrice?: number;
  tier?: string;
  firstName?: string;
  lastName?: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(DEMO_BOOKINGS as Booking[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (!authLoading && user) {
      // In a real app, you would fetch bookings here using user.uid
      setLoading(false);
    }
  }, [user, authLoading, router]);

  if (loading || authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const usedBookings = bookings.filter((b) => b.status === 'used');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  return (
    <>
      {/* Resale Dialog State handled in BookingCard */}
      
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="text-4xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-muted-foreground text-lg mt-2">Manage your event tickets and bookings</p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="confirmed" className="w-full">
          <TabsList>
            <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="used">Used ({usedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="confirmed" className="mt-6 space-y-6">
            {confirmedBookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">You haven&apos;t booked any events yet</p>
                <Link href="/events">
                  <Button className="bg-primary hover:bg-primary/90">Browse Events</Button>
                </Link>
              </Card>
            ) : (
              confirmedBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  status="confirmed" 
                  onUpdate={() => {
                    setBookings(prev => prev.map(b => 
                      b.id === booking.id ? { ...b, isListed: true } : b
                    ));
                  }}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6 space-y-6">
            {pendingBookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending bookings</p>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} status="pending" />
              ))
            )}
          </TabsContent>

          <TabsContent value="used" className="mt-6 space-y-6">
            {usedBookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No past events yet</p>
              </Card>
            ) : (
              usedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} status="used" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function BookingCard({
  booking,
  status,
  onUpdate,
}: {
  booking: Booking;
  status: 'confirmed' | 'pending' | 'used';
  onUpdate?: () => void;
}) {
  const [showQR, setShowQR] = useState(false);
  const [showResaleDialog, setShowResaleDialog] = useState(false);
  const [resalePrice, setResalePrice] = useState(booking.price);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSoldOut = async () => {
      if (!booking.eventId) return;
      try {
        const docRef = doc(db, 'events', booking.eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const eventData = docSnap.data();
          setIsSoldOut(eventData.ticketsAvailable <= 0 || eventData.status === 'sold_out');
        } else {
          const demoEvent = DEMO_EVENTS.find(e => e.id === booking.eventId);
          if (demoEvent) {
            setIsSoldOut(demoEvent.ticketsAvailable <= 0 || demoEvent.status === 'sold_out');
          }
        }
      } catch (error) {
        const demoEvent = DEMO_EVENTS.find(e => e.id === booking.eventId);
        if (demoEvent) {
          setIsSoldOut(demoEvent.ticketsAvailable <= 0 || demoEvent.status === 'sold_out');
        }
      }
    };
    checkSoldOut();
  }, [booking.eventId]);

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    used: 'bg-blue-100 text-blue-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleResaleListing = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, we'd update Firestore
      // await setDoc(doc(collection(db, 'resales')), {
      //   bookingId: booking.id,
      //   eventId: booking.eventId,
      //   sellerId: booking.userId,
      //   price: resalePrice,
      //   originalPrice: booking.price,
      //   status: 'available',
      //   createdAt: serverTimestamp(),
      // });
      
      // For demo, we'll just show a success toast
      toast({
        title: "Ticket Listed!",
        description: `Your ticket for ${booking.eventTitle} is now on the marketplace for MWK ${resalePrice.toLocaleString()}.`,
      });
      setShowResaleDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to list ticket for resale.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resaleDialogModal = (
    <Dialog open={showResaleDialog} onOpenChange={setShowResaleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resell your Ticket</DialogTitle>
          <DialogDescription>
            Set a price for your ticket. Other users will be able to see and buy it from the marketplace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Asking Price (MWK)</Label>
            <Input
              id="price"
              type="number"
              value={resalePrice}
              onChange={(e) => setResalePrice(Number(e.target.value))}
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <InfoIcon className="w-3 h-3" />
              Original price: MWK {booking.price.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs text-orange-800">
            <p className="font-bold mb-1">How it works:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Your ticket will be listed on the Marketplace.</li>
              <li>Once someone buys it, you will receive the funds.</li>
              <li>Your original ticket will be invalidated and a new one issued to the buyer.</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowResaleDialog(false)}>Cancel</Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white" 
            onClick={handleResaleListing}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Listing..." : "Confirm Listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (booking.tier === 'VIP' || booking.tier?.toUpperCase() === 'VIP') {
    return (
      <div className="py-6">
        <div className="max-w-[320px] mx-auto bg-gradient-to-b from-slate-950 via-zinc-900 to-black rounded-[24px] border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-white overflow-hidden relative group transition-all duration-700">
          {/* Holographic / Metallic background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
          
          {/* Exclusive VIP Branding Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-black py-2 px-5 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-between shadow-lg shadow-amber-500/20 relative z-10">
            <div>ELITE VIP</div>
            <div className="text-[8px] bg-black text-amber-300 px-2 py-0.5 rounded-full tracking-[0.2em] font-bold">ALL ACCESS</div>
          </div>

          {/* Event Artwork Header (Vertical layout top) */}
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={booking.eventImage}
              alt={booking.eventTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-125 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase ${booking.status === 'confirmed' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-zinc-800 text-zinc-300'}`}>
                {booking.status}
              </span>
            </div>

            {/* Event Title over image */}
            <div className="absolute bottom-3 left-5 right-5 z-10">
              <p className="text-amber-400 font-bold tracking-[0.2em] text-[8px] uppercase mb-1">
                Premium Live Experience
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
                {booking.eventTitle}
              </h2>
            </div>
          </div>

          {/* Card Body - Attendee, Date, Venue, Tier info */}
          <div className="p-6 space-y-5 relative z-10">
            <div className="grid grid-cols-2 gap-3 pb-5 border-b border-zinc-800/80">
              <div>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Attendee</p>
                <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                  {booking.firstName ? `${booking.firstName} ${booking.lastName}` : 'VIP Guest'}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Ticket Tier</p>
                <div className="text-amber-400 font-black text-sm uppercase tracking-wider">
                  VIP PASS
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Date & Time</p>
                <p className="text-xs font-bold text-zinc-100">{formatDate(booking.eventDate)}</p>
                <p className="text-xs font-bold text-zinc-100 mt-0.5">{booking.eventTime}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Venue</p>
                <p className="text-xs font-bold text-zinc-100 truncate">{booking.eventVenue}</p>
                <p className="text-xs font-bold text-zinc-100 truncate mt-0.5">{booking.eventLocation}</p>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex items-center justify-between shadow-inner">
              <div>
                <p className="text-[10px] text-zinc-400 font-medium">{booking.quantity} Ticket{booking.quantity !== 1 ? 's' : ''}</p>
                <p className="text-sm font-black text-amber-400 mt-0.5">MWK {booking.totalAmount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Order Ref</span>
                <span className="text-[10px] font-mono font-bold text-zinc-300">{booking.id}</span>
              </div>
            </div>
          </div>

          {/* Ticket Stub Perforation Line */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-background rounded-full border-r-2 border-amber-500/50" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-6 h-6 bg-background rounded-full border-l-2 border-amber-500/50" />
            <div className="border-t-2 border-dashed border-zinc-700/50 mx-6" />
          </div>

          <div className="p-6 relative z-10">
            {/* Verification Barcode Section */}
            <div className="text-center space-y-3">
              <div className="bg-white p-4 rounded-xl shadow-xl relative transition-shadow duration-500">
                <div className="flex justify-between items-center mb-2 text-black">
                  <div className="font-black text-[8px] tracking-[0.2em] uppercase text-amber-600">
                    VERIFICATION
                  </div>
                  <span className="text-[8px] font-mono text-zinc-500 font-bold">SEC-99X</span>
                </div>
                
                {/* Custom SVG Barcode */}
                <div className="flex items-center justify-center py-1.5 border-y border-dashed border-zinc-200 my-1.5 bg-zinc-50 rounded">
                  <div className="flex gap-0.5 h-10 items-center justify-center w-full px-1">
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-2.5 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-0.5 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                  </div>
                </div>
                <p className="text-[10px] font-mono font-black tracking-[0.3em] text-zinc-800 mt-1.5">
                  {booking.ticketNumbers?.[0] || 'VIP-9990812'}
                </p>
              </div>
            </div>

            {/* Action Buttons for VIP Ticket */}
            <div className="pt-5 flex gap-2 flex-col">
              <Button variant="outline" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700 hover:border-zinc-600 font-bold uppercase tracking-wider text-[10px] h-10">
                Download Pass
              </Button>
              {!booking.isListed && isSoldOut && (
                <Button 
                  onClick={() => setShowResaleDialog(true)}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black uppercase tracking-wider text-[10px] h-10 shadow-lg shadow-orange-600/30 border-none"
                >
                  Resell Ticket
                </Button>
              )}
            </div>
          </div>
          {resaleDialogModal}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group my-4">
      {/* Regular Ticket Container */}
      <div className="flex flex-col md:flex-row bg-card rounded-[24px] shadow-lg border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-xl group-hover:border-primary/20">
        
        {/* Left Side: Event Details & Image */}
        <div className="flex-1 flex flex-col sm:flex-row">
          {/* Image */}
          <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 relative">
            <img
              src={booking.eventImage}
              alt={booking.eventTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent to-black/20" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md ${
                booking.status === 'confirmed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 p-6 flex flex-col justify-between bg-card relative">
            {/* Subtle watermark */}
            <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
              <TicketIcon className="w-24 h-24" />
            </div>

            <div>
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">{booking.eventTitle}</h3>
                  <div className="flex gap-2 mt-2">
                    {booking.isListed && (
                      <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 items-center gap-1.5 uppercase tracking-widest shadow-sm">
                        <TagIcon className="w-3 h-3" />
                        Listed for Resale
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6 relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Date & Time</p>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>{formatDate(booking.eventDate)} • {booking.eventTime}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Venue</p>
                  <div className="flex items-center gap-2 font-semibold text-foreground truncate">
                    <MapPinIcon className="w-4 h-4 text-primary" />
                    <span className="truncate">{booking.eventLocation}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-xl border border-border/50 relative z-10 w-fit">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ticket Type</p>
                  <p className="font-bold text-foreground capitalize">{booking.tier || 'Regular'} Admission</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quantity</p>
                  <p className="font-bold text-foreground">{booking.quantity}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
                  <p className="font-black text-primary">MWK {booking.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap mt-6 relative z-10">
              {status === 'confirmed' && (
                <>
                  <Button variant="outline" className="gap-2 h-10 rounded-xl font-bold text-xs uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Download
                  </Button>
                  {!booking.isListed && isSoldOut && (
                    <Button 
                      onClick={() => setShowResaleDialog(true)}
                      variant="secondary" 
                      className="gap-2 h-10 rounded-xl font-bold text-xs uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white border-none shadow-md shadow-orange-600/20"
                    >
                      <TagIcon className="w-4 h-4" />
                      Resell
                    </Button>
                  )}
                </>
              )}
              {status === 'pending' && (
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" />
                  Awaiting payment
                </div>
              )}
              {status === 'used' && (
                <Button disabled variant="outline" className="h-10 rounded-xl font-bold text-xs uppercase tracking-wider">
                  Event Completed
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Perforated Divider (Hidden on mobile, vertical on desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center relative bg-card border-l-2 border-dashed border-border/60">
          <div className="absolute top-0 -mt-3 w-6 h-6 bg-background rounded-full border-b-2 border-border/50" />
          <div className="absolute bottom-0 -mb-3 w-6 h-6 bg-background rounded-full border-t-2 border-border/50" />
        </div>
        
        {/* Mobile Perforated Divider (Horizontal on mobile) */}
        <div className="md:hidden flex items-center justify-center relative bg-card border-t-2 border-dashed border-border/60">
          <div className="absolute left-0 -ml-3 w-6 h-6 bg-background rounded-full border-r-2 border-border/50" />
          <div className="absolute right-0 -mr-3 w-6 h-6 bg-background rounded-full border-l-2 border-border/50" />
        </div>

        {/* Right Side: Stub & QR */}
        <div className="md:w-64 bg-muted/30 p-6 flex flex-col items-center justify-center relative border-l border-border/10">
          <div className="text-center w-full">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Admit {booking.quantity}</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm mx-auto mb-4 border border-border/50 hover:shadow-md transition-shadow">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-auto aspect-square max-w-[120px] mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="30" height="30" fill="black" />
                <rect x="60" y="10" width="30" height="30" fill="black" />
                <rect x="10" y="60" width="30" height="30" fill="black" />
                <rect x="45" y="45" width="10" height="10" fill="black" />
                <rect x="20" y="20" width="10" height="10" fill="black" />
                <rect x="70" y="20" width="10" height="10" fill="black" />
                <rect x="20" y="70" width="10" height="10" fill="black" />
                <rect x="40" y="10" width="10" height="10" fill="black" />
                <rect x="80" y="60" width="10" height="10" fill="black" />
                <rect x="60" y="80" width="10" height="10" fill="black" />
                <rect x="80" y="80" width="10" height="10" fill="black" />
              </svg>
            </div>
            
            <p className="text-xs font-mono font-bold text-foreground bg-muted py-1.5 px-3 rounded-lg border border-border/50">
              {booking.id.split('-').pop()}
            </p>
            
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-4">
              Scan at entrance
            </p>
          </div>
        </div>
      </div>

      {resaleDialogModal}
    </div>
  );
}
