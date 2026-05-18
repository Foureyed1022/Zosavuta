'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeftIcon, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    category: 'music',
    date: '',
    time: '18:00',
    location: '',
    venue: '',
    ticketsTotal: '500',
    price: '3500',
    hasSeating: false,
    hasBusTransport: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting event with data:', formData);
    setError('');
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        setError('You must be signed in to create an event');
        setLoading(false);
        return;
      }

      // Validate form
      if (!formData.title || !formData.date || !formData.location || !formData.venue) {
        throw new Error('Please fill in all required fields');
      }

      // Create event in Firestore
      const eventRef = await addDoc(collection(db, 'events'), {
        title: formData.title,
        description: formData.description,
        fullDescription: formData.fullDescription,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        venue: formData.venue,
        ticketsAvailable: parseInt(formData.ticketsTotal),
        ticketsTotal: parseInt(formData.ticketsTotal),
        price: parseInt(formData.price),
        seatingChart: formData.hasSeating,
        busTransport: formData.hasBusTransport,
        organizer: auth.currentUser.uid,
        organizerEmail: auth.currentUser.email,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
        createdAt: serverTimestamp(),
        status: 'draft',
      });

      // Redirect to organizer dashboard
      router.push(`/organizer/dashboard`);

    } catch (err: any) {
      console.error('Create event error:', err);
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
}
  return (
    <>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-xs w-fit">
          <ChevronLeftIcon className="w-5 h-5" />
          Back Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Create Event</h1>
          <p className="text-muted-foreground mb-8">
            Fill in the details below to create and publish your event.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-bold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="title">Event Title *</FieldLabel>
                  <Input
                    id="title"
                    placeholder="e.g., Afrobeats Music Festival"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Short Description *</FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your event (shown in event listings)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-20"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="fullDescription">Full Description</FieldLabel>
                  <Textarea
                    id="fullDescription"
                    placeholder="Detailed description of your event (shown on event detail page)"
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    className="min-h-32"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                    <option value="conference">Conference</option>
                    <option value="festival">Festival</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Event Details */}
            <div>
              <h2 className="text-lg font-bold mb-4">Event Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="date">Event Date *</FieldLabel>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="time">Event Time *</FieldLabel>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="location">Location/City *</FieldLabel>
                  <Input
                    id="location"
                    placeholder="e.g., Nairobi, Kenya"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="venue">Venue Name *</FieldLabel>
                  <Input
                    id="venue"
                    placeholder="e.g., Safari Park Hotel"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Ticket Info */}
            <div>
              <h2 className="text-lg font-bold mb-4">Ticket Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="ticketsTotal">Total Tickets *</FieldLabel>
                    <Input
                      id="ticketsTotal"
                      type="number"
                      placeholder="500"
                      value={formData.ticketsTotal}
                      onChange={(e) => setFormData({ ...formData, ticketsTotal: e.target.value })}
                      min="1"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="price">Price per Ticket (MWK) *</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      placeholder="3500"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="1"
                      required
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                  <input
                    type="checkbox"
                    checked={formData.hasSeating}
                    onChange={(e) => setFormData({ ...formData, hasSeating: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Assigned seating (premium feature)</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                  <input
                    type="checkbox"
                    checked={formData.hasBusTransport}
                    onChange={(e) => setFormData({ ...formData, hasBusTransport: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Offer bus transport (+1,500 MWK)</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-border">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-base h-12 font-semibold"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
