'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  PlusIcon, 
  TrendingUpIcon, 
  TicketIcon, 
  UserIcon, 
  DollarSignIcon,
  LogOutIcon 
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { DEMO_ANALYTICS } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

interface Event {
  id: string;
  title: string;
  date: string;
  ticketsTotal: number;
  ticketsAvailable: number;
  price: number;
  status: string;
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'customer' | 'organizer' | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeEvents: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const roleDoc = await getDoc(doc(db, 'users', user.uid));
        if (roleDoc.exists()) {
          setUserRole(roleDoc.data().role as 'customer' | 'organizer');
        }
      } catch (error) {
        console.warn('Unable to fetch user role for organizer dashboard.');
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'events'), where('organizer', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const eventsData: Event[] = [];
        let totalRevenue = 0;
        let totalTickets = 0;

        querySnapshot.forEach((doc) => {
          const event = { id: doc.id, ...doc.data() } as Event;
          eventsData.push(event);

          const ticketsSold = event.ticketsTotal - event.ticketsAvailable;
          totalRevenue += ticketsSold * event.price;
          totalTickets += ticketsSold;
        });

        setEvents(eventsData);
        setStats({
          totalEvents: eventsData.length,
          totalRevenue,
          totalTicketsSold: totalTickets,
          activeEvents: eventsData.filter((e) => e.status === 'active').length,
        });
      } catch (error) {
        console.error('Error fetching events:', error);
        // Show demo data
        setStats({
          totalEvents: 5,
          totalRevenue: 278000,
          totalTicketsSold: 350,
          activeEvents: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Muli bwanji, {user?.displayName?.split(' ')[0] || 'Organizer'}! 👋</h1>
            <p className="text-muted-foreground text-lg mt-2">Manage your events and track sales in MWK</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="h-12 px-6 text-foreground hover:bg-muted/50">
                Switch to Attendee Dashboard
              </Button>
            </Link>
            <Link href="/organizer">
              <Button className="bg-primary hover:bg-primary/90 h-12 px-6 gap-2">
                <PlusIcon className="w-5 h-5" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<TrendingUpIcon className="w-6 h-6" />}
            label="Total Revenue"
            value={`MWK ${stats.totalRevenue.toLocaleString()}`}
          />
          <StatCard
            icon={<TicketIcon className="w-6 h-6" />}
            label="Tickets Sold"
            value={stats.totalTicketsSold.toString()}
          />
          <StatCard
            icon={<UserIcon className="w-6 h-6" />}
            label="Total Events"
            value={stats.totalEvents.toString()}
          />
          <StatCard
            icon={<DollarSignIcon className="w-6 h-6" />}
            label="Active Events"
            value={stats.activeEvents.toString()}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={DEMO_ANALYTICS.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Weekly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={DEMO_ANALYTICS.sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="var(--color-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Events Table */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Events ({events.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({events.filter((e) => e.status === 'active').length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({events.filter((e) => e.status === 'draft').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <EventsTable events={events} />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <EventsTable events={events.filter((e) => e.status === 'active')} />
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            <EventsTable events={events.filter((e) => e.status === 'draft')} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
        </div>
        <div className="text-accent opacity-50">{icon}</div>
      </div>
    </Card>
  );
}

function EventsTable({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No events yet</p>
        <Link href="/organizer">
          <Button className="bg-primary hover:bg-primary/90">Create Your First Event</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Event Name</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Tickets</th>
              <th className="px-6 py-3 text-left font-semibold">Revenue</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => {
              const ticketsSold = event.ticketsTotal - event.ticketsAvailable;
              const revenue = ticketsSold * event.price;
              return (
                <tr key={event.id} className="hover:bg-muted/50 transition">
                  <td className="px-6 py-4 font-medium">{event.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{event.date}</td>
                  <td className="px-6 py-4">
                    {ticketsSold}/{event.ticketsTotal}
                  </td>
                  <td className="px-6 py-4 font-semibold">MWK {revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
