'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CalendarIcon, MapPinIcon, Crown, Sparkles, ShieldCheck, User, Star, TagIcon, InfoIcon } from 'lucide-react';
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
        <div className="max-w-md mx-auto bg-gradient-to-b from-slate-950 via-zinc-900 to-black rounded-[36px] border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white overflow-hidden relative group hover:border-amber-400 hover:shadow-[0_0_60px_rgba(245,158,11,0.4)] transition-all duration-700">
          {/* Holographic / Metallic background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-all duration-700 pointer-events-none" />
          
          {/* Exclusive VIP Branding Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-black py-2.5 px-6 font-black uppercase tracking-[0.3em] text-xs flex items-center justify-between shadow-lg shadow-amber-500/20 relative z-10">
            <div className="flex items-center gap-1.5 font-extrabold">
              <Crown className="w-4 h-4 fill-black" />
              <span>ELITE VIP ACCESS</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] bg-black text-amber-300 px-2.5 py-0.5 rounded-full tracking-widest font-bold">ALL ACCESS</span>
            </div>
          </div>

          {/* Event Artwork Header (Vertical layout top) */}
          <div className="relative h-64 w-full overflow-hidden">
            <img
              src={booking.eventImage}
              alt={booking.eventTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-125 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${booking.status === 'confirmed' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 font-extrabold' : 'bg-zinc-800 text-zinc-300'}`}>
                {booking.status}
              </span>
            </div>

            {/* Resale Listed Badge */}
            {booking.isListed && (
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-orange-600 text-white flex items-center gap-1.5 shadow-lg shadow-orange-600/40 animate-pulse font-extrabold">
                  <TagIcon className="w-3.5 h-3.5" />
                  Listed for Resale
                </span>
              </div>
            )}

            {/* Event Title over image */}
            <div className="absolute bottom-4 left-6 right-6 z-10">
              <p className="text-amber-400 font-black tracking-widest text-xs uppercase mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Premium Live Experience
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
                {booking.eventTitle}
              </h2>
            </div>
          </div>

          {/* Card Body - Attendee, Date, Venue, Tier info */}
          <div className="p-8 space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-zinc-800/80">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Attendee / Holder</p>
                <p className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{booking.firstName ? `${booking.firstName} ${booking.lastName}` : 'VIP Guest'}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Ticket Tier</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm uppercase tracking-wider shadow-inner">
                  <Crown className="w-4 h-4" /> VIP PASS
                </div>
              </div>
            </div>

            <div className="space-y-4 pb-6 border-b border-zinc-800/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date & Time</p>
                  <p className="text-base font-bold text-white">{formatDate(booking.eventDate)} • {booking.eventTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
                  <MapPinIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Venue & City</p>
                  <p className="text-base font-bold text-white">{booking.eventVenue}, {booking.eventLocation}</p>
                </div>
              </div>
            </div>

            {/* Pricing & Quantity Summary */}
            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-900/60 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between shadow-inner">
              <div>
                <p className="text-xs text-zinc-400 font-medium">{booking.quantity} VIP Ticket{booking.quantity !== 1 ? 's' : ''} × MWK {booking.price.toLocaleString()}</p>
                <p className="text-xl font-black text-amber-400 mt-0.5">Total: MWK {booking.totalAmount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Order Ref</span>
                <span className="text-xs font-mono font-bold text-zinc-300">{booking.id}</span>
              </div>
            </div>

            {/* Verification Barcode Section */}
            <div className="pt-2 text-center space-y-3">
              <div className="bg-white p-5 rounded-2xl max-w-[300px] mx-auto shadow-xl relative group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow duration-500">
                <div className="flex justify-between items-center mb-3 text-black">
                  <div className="flex items-center gap-1 font-black text-[10px] tracking-widest uppercase text-amber-600">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECURE VIP VERIFICATION
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold">SEC-99X</span>
                </div>
                
                {/* Custom SVG Barcode */}
                <div className="flex items-center justify-center py-2 border-y-2 border-dashed border-zinc-200 my-2 bg-zinc-50 rounded">
                  <div className="flex gap-1 h-14 items-center justify-center w-full px-2">
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-3 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-2.5 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-4 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-3 h-full bg-black"></div>
                    <div className="w-1.5 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-3.5 h-full bg-black"></div>
                    <div className="w-1 h-full bg-black"></div>
                    <div className="w-2 h-full bg-black"></div>
                  </div>
                </div>
                <p className="text-[12px] font-mono font-black tracking-[0.3em] text-zinc-800 mt-2">
                  {booking.ticketNumbers?.[0] || 'VIP-9990812'}
                </p>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium italic">
                Present barcode at the exclusive VIP fast-track entrance.
              </p>
            </div>

            {/* Action Buttons for VIP Ticket */}
            <div className="pt-4 border-t border-zinc-800/80 flex gap-3 flex-wrap">
              <Button variant="outline" className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700 hover:border-zinc-600 font-bold uppercase tracking-wider text-xs h-12">
                Download Pass
              </Button>
              {!booking.isListed && isSoldOut && (
                <Button 
                  onClick={() => setShowResaleDialog(true)}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black uppercase tracking-wider text-xs h-12 shadow-lg shadow-orange-600/30 border-none"
                >
                  <TagIcon className="w-4 h-4 mr-1.5" />
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
    <Card className="overflow-hidden">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-48 h-48 flex-shrink-0">
          <img
            src={booking.eventImage}
            alt={booking.eventTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{booking.eventTitle}</h3>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[booking.status]
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  {booking.isListed && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 flex items-center gap-1">
                      <TagIcon className="w-3 h-3" />
                      Listed for Resale
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {formatDate(booking.eventDate)} at {booking.eventTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{booking.eventLocation}</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm mb-4">
              <p className="text-muted-foreground">
                {booking.quantity} ticket{booking.quantity !== 1 ? 's' : ''} × MWK {booking.price.toLocaleString()}
              </p>
              <p className="font-bold text-foreground">Total: MWK {booking.totalAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {status === 'confirmed' && (
              <>
                <Button
                  onClick={() => setShowQR(!showQR)}
                  variant="outline"
                  className="gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download Tickets
                </Button>
                {!booking.isListed && isSoldOut && (
                  <Button 
                    onClick={() => setShowResaleDialog(true)}
                    variant="secondary" 
                    className="gap-2 bg-orange-600 hover:bg-orange-700 text-white border-none"
                  >
                    <TagIcon className="w-4 h-4" />
                    Resell Ticket
                  </Button>
                )}
              </>
            )}
            {status === 'pending' && (
              <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                Awaiting payment confirmation
              </div>
            )}
            {status === 'used' && (
              <Button disabled variant="outline">
                Event Completed
              </Button>
            )}
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="bg-muted p-6 rounded-lg text-center">
                <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full p-4"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="30" height="30" fill="black" />
                    <rect x="60" y="10" width="30" height="30" fill="black" />
                    <rect x="10" y="60" width="30" height="30" fill="black" />
                    <rect x="45" y="45" width="10" height="10" fill="black" />
                    <text x="50" y="95" textAnchor="middle" fontSize="4" fill="black">
                      QR Code
                    </text>
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  Show this code at the event entrance
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Order ID: {booking.id}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {resaleDialogModal}
    </Card>
  );
}
