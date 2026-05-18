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
  BellIcon
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { DEMO_BOOKINGS } from '@/lib/mock-data';

interface Booking {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  status: string;
  quantity: number;
}

export default function AttendeeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Member');
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    upcomingEvents: 0,
    loyaltyPoints: 1250,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push('/auth');
          return;
        }

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

        if (bookingsData.length === 0) {
          // Use demo data if no real data exists
          setUpcomingBookings(DEMO_BOOKINGS.slice(0, 3));
          setStats({
            totalTickets: DEMO_BOOKINGS.length,
            upcomingEvents: DEMO_BOOKINGS.filter(b => b.status === 'confirmed').length,
            loyaltyPoints: 1250,
          });
        } else {
          setUpcomingBookings(bookingsData);
          setStats({
            totalTickets: bookingsData.length,
            upcomingEvents: bookingsData.filter(b => b.status === 'confirmed').length,
            loyaltyPoints: 1250 + (bookingsData.length * 50),
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUpcomingBookings(DEMO_BOOKINGS.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
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
          <div className="flex gap-3">
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
          
          <Card className="bg-secondary/5 border-none shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <StarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Loyalty Points</p>
                <h3 className="text-2xl font-bold">{stats.loyaltyPoints.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>

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
                  <Card key={booking.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-32 h-32 sm:h-auto overflow-hidden">
                        <img 
                          src={booking.eventImage} 
                          alt={booking.eventTitle}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{booking.eventTitle}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {new Date(booking.eventDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="w-3.5 h-3.5" />
                                {booking.eventLocation.split(',')[0]}
                              </span>
                            </div>
                          </div>
                          <Link href={`/my-bookings`}>
                            <Button size="icon" variant="ghost" className="rounded-full">
                              <QrCodeIcon className="w-5 h-5 text-primary" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
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
