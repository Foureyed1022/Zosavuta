'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TicketIcon, MapPinIcon, BusIcon, ShieldCheckIcon, PlusIcon } from 'lucide-react';
import Navigation from '@/components/navigation';

export default function HomePage() {
  return (
    <>
      {/* Dual Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-balance">
              Experience Events <span className="text-primary italic">Simplified.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Whether you're looking for the next big music festival or planning a corporate summit,
              Zosavuta connects you to what matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {/* Attendee Path */}
            <Card className="group relative overflow-hidden p-8 border-2 border-primary/10 hover:border-primary/40 transition-all duration-300 bg-gradient-to-br from-card to-primary/5">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TicketIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">I want to attend</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Browse thousands of events, secure your tickets, and even book your transport all in one place.
                </p>
                <Link href="/events">
                  <Button size="lg" className="w-full text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Discover Events
                  </Button>
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            </Card>

            {/* Organizer Path */}
            <Card className="group relative overflow-hidden p-8 border-2 border-secondary/10 hover:border-secondary/40 transition-all duration-300 bg-gradient-to-br from-card to-secondary/5">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PlusIcon className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">I want to organize</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Reach a wider audience, manage ticket sales, and track analytics with our powerful dashboard.
                </p>
                <Link href="/organizer">
                  <Button size="lg" variant="secondary" className="w-full text-lg h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Create Event
                  </Button>
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors" />
            </Card>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">
            Why Choose Zosavuta?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<TicketIcon className="w-8 h-8" />}
              title="Easy Ticketing"
              description="Browse and book tickets for your favorite events in seconds"
            />
            <FeatureCard
              icon={<MapPinIcon className="w-8 h-8" />}
              title="Find Events Nearby"
              description="Discover events happening in your area with our location-based search"
            />
            <FeatureCard
              icon={<BusIcon className="w-8 h-8" />}
              title="Transport Included"
              description="Skip the hassle. We arrange buses to take you to and from events"
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="w-8 h-8" />}
              title="Secure Payments"
              description="Your transactions are protected with our secure payment gateway"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Book Your First Event?</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of event enthusiasts who trust Zosavuta for their ticketing and transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Browse Events
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="text-accent mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
