'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, FilterIcon, TagIcon, ShieldCheckIcon, TrendingDownIcon, ArrowRightIcon } from 'lucide-react';
import { DEMO_EVENTS } from '@/lib/mock-data';

// Mock Resale Data
const MOCK_RESALES = [
  {
    id: 'RS-001',
    eventId: '1',
    eventTitle: 'Afrobeats Music Festival',
    eventDate: '2026-06-15',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    originalPrice: 3500,
    resalePrice: 3000,
    seller: 'Kondwani M.',
    isFairPrice: true,
  },
  {
    id: 'RS-002',
    eventId: '2',
    eventTitle: 'Tech Innovation Summit 2026',
    eventDate: '2026-06-20',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    originalPrice: 2500,
    resalePrice: 2800,
    seller: 'Sarah J.',
    isFairPrice: false,
  },
  {
    id: 'RS-003',
    eventId: '1',
    eventTitle: 'Afrobeats Music Festival',
    eventDate: '2026-06-15',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    originalPrice: 3500,
    resalePrice: 3500,
    seller: 'Gift K.',
    isFairPrice: true,
  },
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resales, setResales] = useState(MOCK_RESALES);

  useEffect(() => {
    if (searchTerm) {
      setResales(MOCK_RESALES.filter(r => 
        r.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.seller.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setResales(MOCK_RESALES);
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-6 px-4 py-1">
              Official Marketplace
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-none">
              BUY & SELL <br />
              <span className="text-orange-200 italic">SECURELY.</span>
            </h1>
            <p className="text-lg text-orange-100 font-medium mb-8 max-w-xl">
              Missed out on tickets? Or can't make it to an event? Buy and sell tickets safely with Zosavuta's verified marketplace.
            </p>
            
            <div className="relative group max-w-xl">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <SearchIcon className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search resales for events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 bg-transparent outline-none text-foreground font-bold placeholder:text-muted-foreground/60"
                  />
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <p className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2 text-center md:text-left">Fan to Fan</p>
              <h2 className="text-4xl font-black tracking-tighter uppercase text-center md:text-left">Available <span className="text-orange-600">Resales</span></h2>
            </div>
            <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-full px-4">
               <TrendingDownIcon className="w-4 h-4 text-green-600" />
               <span className="text-xs font-bold uppercase tracking-widest italic">3 Great deals found today</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resales.length > 0 ? (
              resales.map((resale) => (
                <ResaleCard key={resale.id} resale={resale} />
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border/50">
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">No resales found</h3>
                <p className="text-muted-foreground">Try searching for a different event or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-12">Why buy on the Marketplace?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-orange-600">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Verified Tickets</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Every resale ticket is verified by Zosavuta. Once sold, the original is invalidated and a new one issued.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-orange-600">
                <TagIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Fair Pricing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">We flag listings with a "Fair Price" badge if they are sold at or below the original face value.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-orange-600">
                <ArrowRightIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Instant Transfer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Receive your digital tickets immediately after a successful payment. No waiting, no hassle.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResaleCard({ resale }: { resale: any }) {
  return (
    <Card className="group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[32px] bg-card">
      <div className="relative h-64 overflow-hidden">
        <img
          src={resale.image}
          alt={resale.eventTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          {resale.isFairPrice && (
            <Badge className="bg-green-600 text-white border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1">
              Fair Price
            </Badge>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-black/60 backdrop-blur-md text-white rounded-2xl p-2 px-3 flex items-center gap-2">
             <TagIcon className="w-4 h-4 text-orange-400" />
             <span className="text-xs font-black uppercase tracking-tighter italic">Resale</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
           <p className="text-white text-xs font-medium italic">Seller: {resale.seller}</p>
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-orange-600 font-black text-[10px] uppercase tracking-widest mb-1">{resale.eventDate}</p>
            <h3 className="text-2xl font-black tracking-tight leading-tight uppercase group-hover:text-orange-600 transition-colors">{resale.eventTitle}</h3>
          </div>
        </div>

        <div className="flex items-center justify-between py-6 border-y border-border/50 my-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Asking Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground tracking-tighter italic">MWK {resale.resalePrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Original</p>
             <p className="text-sm font-bold text-muted-foreground line-through decoration-orange-600 decoration-2 italic">MWK {resale.originalPrice.toLocaleString()}</p>
          </div>
        </div>

        <Link href={`/checkout/${resale.eventId}?resale=${resale.id}`}>
          <Button className="w-full bg-foreground text-background hover:bg-orange-600 hover:text-white transition-all duration-300 h-14 rounded-2xl font-black uppercase tracking-widest text-xs group/btn">
            Buy Now
            <ArrowRightIcon className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
