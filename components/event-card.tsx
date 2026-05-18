import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPinIcon, CalendarIcon, TicketIcon } from 'lucide-react';
import Image from 'next/image';

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

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  const { month, day } = formatDate(event.date);

  return (
    <Card className="h-full overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group bg-card flex flex-col">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Date Overlay */}
        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center w-14 h-16 border border-border/50">
          <span className="text-[10px] font-bold text-primary tracking-wider uppercase leading-none mt-1">{month}</span>
          <span className="text-2xl font-black text-foreground leading-none mb-1">{day}</span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">
            {event.category}
          </Badge>
        </div>

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Organizer/Presenter */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Presented by</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground truncate">{event.organizer || 'Zosavuta Events'}</span>
        </div>

        <h3 className="font-extrabold text-xl mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight">
          {event.title}
        </h3>

        <div className="space-y-2 mt-auto">
          {/* Venue and Time */}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-tight">
            <MapPinIcon className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{event.venue || event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarIcon className="w-3.5 h-3.5 text-primary/60" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Tickets from</span>
            <div className="font-black text-2xl text-primary flex items-baseline gap-1">
              <span className="text-sm font-bold">MWK</span>
              <span>{event.price.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <TicketIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Card>
  );
}

