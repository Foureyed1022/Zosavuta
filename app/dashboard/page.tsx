'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  TicketIcon, 
  CalendarIcon, 
  MapPinIcon, 
  QrCodeIcon, 
  ChevronRightIcon,
  StarIcon,
  ClockIcon,
  BellIcon,
  TrophyIcon,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, limit, orderBy } from 'firebase/firestore';
import { DEMO_BOOKINGS } from '@/lib/mock-data';
import { getBookingsByUser as getBusBookingsByUser } from '@/lib/bus/firebase';
import { useAuth } from '@/hooks/use-auth';
import { calculateTotalPoints } from '@/lib/legacy-points';

interface Booking {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  status: string;
  quantity: number;
  totalAmount: number;
  tier?: string;
  busTransport?: boolean;
}

export default function AttendeeDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Member');
  const [userRole, setUserRole] = useState<'customer' | 'organizer' | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    upcomingEvents: 0,
    legacyPoints: 0,
  });

  const formatShortDate = (dateString: string) => {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[monthIndex]} ${day}`;
    }
    return dateString;
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setUserName(user.displayName?.split(' ')[0] || 'Member');

        // Fetch bookings from Firestore
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid),
          orderBy('eventDate', 'asc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        
        const bookingsData: Booking[] = [];
        querySnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
        });

        // Also fetch bus bookings for this user and merge them into the dashboard
        let busBookings: any[] = [];
        try {
          busBookings = await getBusBookingsByUser(user.uid);
        } catch (e) {
          console.warn('Failed to fetch bus bookings for dashboard', e);
        }

        // Normalize bus bookings into the same Booking shape used by the dashboard
        const normalizedBusBookings: Booking[] = busBookings.map((b: any) => ({
          id: b.id,
          eventTitle: `Bus: ${b.tripId}`,
          eventDate: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          eventTime: '',
          eventLocation: '',
          eventImage: '/zosavuta.png',
          status: b.status ?? 'confirmed',
          quantity: b.seats ?? b.seatNumbers?.length ?? 1,
          totalAmount: b.totalPrice ?? b.totalPrice ?? 0,
          busTransport: true,
        }));

        const combined = [...bookingsData, ...normalizedBusBookings];

        if (combined.length === 0) {
          // Use demo data if no real data exists
          setUpcomingBookings(DEMO_BOOKINGS.slice(0, 3));
          setStats({
            totalTickets: DEMO_BOOKINGS.length,
            upcomingEvents: DEMO_BOOKINGS.filter(b => b.status === 'confirmed').length,
            legacyPoints: calculateTotalPoints(DEMO_BOOKINGS),
          });
        } else {
          setUpcomingBookings(combined.slice(0, 3));
          const totalTicketsCount = combined.reduce((acc, cur) => acc + (cur.quantity ?? 1), 0);
          setStats({
            totalTickets: totalTicketsCount,
            upcomingEvents: combined.filter(b => b.status === 'confirmed').length,
            legacyPoints: calculateTotalPoints(
              combined.map((b, i) => ({
                totalAmount: b.totalAmount ?? 0,
                tier: b.tier,
                busTransport: (b as any).busTransport,
                isFirstBooking: i === 0,
              }))
            ),
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUpcomingBookings(DEMO_BOOKINGS.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRole = async () => {
      try {
        const roleDoc = await getDoc(doc(db, 'users', user.uid));
        if (roleDoc.exists()) {
          setUserRole(roleDoc.data().role as 'customer' | 'organizer');
        } else {
          setUserRole('customer');
        }
      } catch (error) {
        console.warn('Unable to fetch user role, defaulting to attendee.');
        setUserRole('customer');
      }
    };

    fetchDashboardData();
    fetchUserRole();
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Muli bwanji, {userName}! 👋</h1>
            <p className="text-muted-foreground text-lg">You have {stats.upcomingEvents} events coming up this month.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {userRole === 'organizer' && (
              <Link href="/organizer/dashboard">
                <Button variant="outline" className="h-12 px-6 text-foreground hover:bg-muted/50">
                  Switch to Organizer Dashboard
                </Button>
              </Link>
            )}
            <Link href="/events">
              <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6">
                <TicketIcon className="w-5 h-5" />
                Find New Events
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary/5 border-none shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Upcoming Events</p>
                <h3 className="text-2xl font-bold">{stats.upcomingEvents}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Link href="/legacy-points" className="block">
            <Card className="bg-secondary/5 border-none shadow-none hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <TrophyIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground font-medium">Legacy Points</p>
                  <h3 className="text-2xl font-bold">{stats.legacyPoints.toLocaleString()}</h3>
                  <p className="text-xs text-primary font-semibold mt-0.5">View rewards →</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-accent/5 border-none shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-foreground">
                <ClockIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Tickets</p>
                <h3 className="text-2xl font-bold">{stats.totalTickets}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - Upcoming Tickets */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold tracking-tight">Your Upcoming Tickets</h2>
              <Link href="/my-bookings" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <TicketIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No tickets yet</h3>
                <p className="text-muted-foreground mb-6">Discover amazing events happening around you.</p>
                <Link href="/events">
                  <Button variant="outline">Browse Events</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="relative group transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row bg-card rounded-[20px] shadow-sm border border-border/50 overflow-hidden hover:shadow-lg group-hover:border-primary/20 transition-all">
                      
                      {/* Left: Image & Details */}
                      <div className="flex-1 flex flex-row p-4 gap-4 relative">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={booking.eventImage} 
                            alt={booking.eventTitle}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden">
                          <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-1 truncate">{booking.eventTitle}</h3>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1 shrink-0">
                              <CalendarIcon className="w-3 h-3 text-primary" />
                              {formatShortDate(booking.eventDate)}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPinIcon className="w-3 h-3 text-primary" />
                              <span className="truncate">{booking.eventLocation.split(',')[0]}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Perforated Divider */}
                      <div className="hidden sm:flex flex-col items-center justify-center relative bg-card border-l-2 border-dashed border-border/60">
                        <div className="absolute top-0 -mt-2 w-4 h-4 bg-background rounded-full border-b-2 border-border/50" />
                        <div className="absolute bottom-0 -mb-2 w-4 h-4 bg-background rounded-full border-t-2 border-border/50" />
                      </div>

                      <div className="sm:hidden flex items-center justify-center relative bg-card border-t-2 border-dashed border-border/60">
                        <div className="absolute left-0 -ml-2 w-4 h-4 bg-background rounded-full border-r-2 border-border/50" />
                        <div className="absolute right-0 -mr-2 w-4 h-4 bg-background rounded-full border-l-2 border-border/50" />
                      </div>

                      {/* Right Stub: Action */}
                      <div className="sm:w-28 bg-muted/30 p-4 flex flex-col items-center justify-center relative">
                        <Link href={`/my-bookings`}>
                          <Button size="icon" className="rounded-xl w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-sm group-hover:scale-110 transition-transform">
                            <QrCodeIcon className="w-5 h-5" />
                          </Button>
                        </Link>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">View Ticket</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Recommendations & Notifications */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Notifications</h2>
              <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                  {upcomingBookings.filter(b => (b as any).busTransport).map((b) => (
                    <div key={`bus-${b.id}`} className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <BellIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Your bus booking {b.id} is confirmed.</p>
                        <p className="text-xs text-muted-foreground mt-1">Recently</p>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BellIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Your ticket for Afrobeats Music Festival is ready!</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <StarIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">You earned 100 points for your last booking.</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Promotions</h2>
              <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-none shadow-lg overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Early Bird Special!</h3>
                    <p className="text-sm text-secondary-foreground/80 mb-4">Get 20% off all tech events this month with code TECH20.</p>
                    <Link href="/events?category=conference">
                      <Button className="bg-white text-secondary hover:bg-white/90 font-bold w-full">
                        Claim Discount
                      </Button>
                    </Link>
                  </div>
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
