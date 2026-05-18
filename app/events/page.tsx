'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EventCard from '@/components/event-card';
import CategoryChips from '@/components/category-chips';
import { SearchIcon, FilterIcon, CalendarIcon, MapPinIcon, Sparkles } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { DEMO_EVENTS } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  image: string;
  category: string;
  ticketsAvailable: number;
  price: number;
  organizer: string;
}

export default function EventsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'));
        const querySnapshot = await getDocs(q);
        const eventsData: Event[] = [];
        
        querySnapshot.forEach((doc) => {
          eventsData.push({
            id: doc.id,
            ...doc.data(),
          } as Event);
        });

        if (eventsData.length === 0) {
          setEvents(DEMO_EVENTS);
          setFilteredEvents(DEMO_EVENTS);
        } else {
          setEvents(eventsData);
          setFilteredEvents(eventsData);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents(DEMO_EVENTS);
        setFilteredEvents(DEMO_EVENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((event) => event.category === categoryFilter);
    }

    if (sortBy === 'upcoming') {
      filtered = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, categoryFilter, sortBy]);

  if (authLoading && loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const featuredEvents = filteredEvents.slice(0, 3);
  const remainingEvents = filteredEvents.slice(3);

  return (
    <>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center overflow-hidden bg-foreground">
        {/* Background Pattern/Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
           {featuredEvents[0] && (
             <img 
               src={featuredEvents[0].image} 
               alt="Hero Background" 
               className="w-full h-full object-cover blur-sm scale-105"
             />
           )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Now Happening in Malawi</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
              DISCOVER <br />
              <span className="text-primary italic">MEMORIES.</span>
            </h1>
            <p className="text-lg text-white/70 font-medium mb-10 max-w-lg leading-relaxed">
              From the biggest festivals to the most intimate workshops. Find your next experience on Zosavuta.
            </p>

            {/* Prominent Search Bar */}
            <div className="relative group max-w-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-foreground rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2">
                <div className="flex-1 flex items-center px-4 gap-3 border-r border-border">
                  <SearchIcon className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search events, venues, or cities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 bg-transparent outline-none text-foreground font-bold placeholder:text-muted-foreground/60 placeholder:font-medium"
                  />
                </div>
                <Button className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 rounded-lg font-black uppercase tracking-widest text-xs ml-2">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-[72px] z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <CategoryChips 
              selectedCategory={categoryFilter} 
              onSelectCategory={setCategoryFilter} 
            />
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                <FilterIcon className="w-4 h-4 text-primary" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-none bg-transparent h-auto p-0 focus:ring-0 w-[140px] text-xs font-bold uppercase tracking-wider">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Curating Events...</p>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-24 text-center bg-card rounded-3xl border-2 border-dashed border-border/50">
              <div className="text-6xl mb-6">🎫</div>
              <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">No events matching your vibe</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">Try adjusting your filters or search terms to discover more.</p>
              <Button 
                variant="outline" 
                onClick={() => {setSearchTerm(''); setCategoryFilter('all');}}
                className="mt-8 rounded-full px-8 border-primary text-primary font-bold hover:bg-primary/5"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-20">
              {/* Featured Section */}
              {categoryFilter === 'all' && !searchTerm && featuredEvents.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">Editor's Choice</p>
                      <h2 className="text-4xl font-black tracking-tighter uppercase">Featured <span className="text-primary">Events</span></h2>
                    </div>
                    <div className="hidden md:flex gap-2">
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Top picks for you</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredEvents.map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`} className="transition-transform hover:-translate-y-2 duration-500">
                        <EventCard event={event} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* All Events Section */}
              <div className="space-y-8">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                      {categoryFilter === 'all' ? 'Discover More' : `${categoryFilter} Events`}
                    </p>
                    <h2 className="text-4xl font-black tracking-tighter uppercase">
                      {categoryFilter === 'all' ? 'Upcoming ' : ''}
                      <span className="text-primary">{categoryFilter === 'all' ? 'All' : categoryFilter}</span> Events
                    </h2>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:block">
                    {filteredEvents.length} events found
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingEvents.length > 0 ? (
                    remainingEvents.map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`} className="transition-transform hover:-translate-y-2 duration-500">
                        <EventCard event={event} />
                      </Link>
                    ))
                  ) : (
                    // If no remaining events but featured exists, and we are not in featured mode
                    (categoryFilter !== 'all' || searchTerm) && filteredEvents.map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`} className="transition-transform hover:-translate-y-2 duration-500">
                        <EventCard event={event} />
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter / Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-primary rounded-[32px] p-8 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-md text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight tracking-tighter uppercase">Don't miss the <span className="text-foreground italic">Moment.</span></h2>
              <p className="text-primary-foreground/80 font-medium">Get the best events in Malawi delivered straight to your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <div className="flex-1 md:w-80">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl px-6 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <Button className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest text-xs">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

