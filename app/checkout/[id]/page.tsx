'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldLabel } from '@/components/ui/field';
import { ChevronLeftIcon, ShieldCheckIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { DEMO_EVENTS } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

interface Event {
  id: string;
  title: string;
  price: number;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth?redirect=/checkout/${eventId}`);
    }
  }, [user, authLoading, router, eventId]);

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [fetchingEvent, setFetchingEvent] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
        } else {
          setEvent(DEMO_EVENTS.find(e => e.id === eventId) || null);
        }
      } catch (error: any) {
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.warn('Firestore is offline, falling back to demo data for checkout:', eventId);
        } else {
          console.error('Error fetching event for checkout:', error);
        }
        setEvent(DEMO_EVENTS.find(e => e.id === eventId) || null);
      } finally {
        setFetchingEvent(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Form state
  const [attendeeInfo, setAttendeeInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [cardInfo, setCardInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [confirmationDetails, setConfirmationDetails] = useState({
    orderId: '',
    email: '',
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeInfo.firstName || !attendeeInfo.lastName || !attendeeInfo.email || !attendeeInfo.phone) {
      alert('Please fill in all fields');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      const orderId = `ZOS-${Date.now()}`;
      setConfirmationDetails({
        orderId,
        email: attendeeInfo.email,
      });
      setLoading(false);
      setStep('confirmation');
    }, 2000);
  };

  const handleFinish = () => {
    router.push('/');
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/events" className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-xs w-fit">
          <ChevronLeftIcon className="w-5 h-5" />
          Back to Events
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'details' && (
              <Card className="p-8">
                <h1 className="text-2xl font-bold mb-6">Attendee Information</h1>

                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={attendeeInfo.firstName}
                        onChange={(e) =>
                          setAttendeeInfo({ ...attendeeInfo, firstName: e.target.value })
                        }
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={attendeeInfo.lastName}
                        onChange={(e) =>
                          setAttendeeInfo({ ...attendeeInfo, lastName: e.target.value })
                        }
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={attendeeInfo.email}
                      onChange={(e) =>
                        setAttendeeInfo({ ...attendeeInfo, email: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+265 8XX XXX XXX"
                      value={attendeeInfo.phone}
                      onChange={(e) =>
                        setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-base h-12 font-semibold">
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            )}

            {step === 'payment' && (
              <Card className="p-8">
                <h1 className="text-2xl font-bold mb-6">Payment Details</h1>
                <p className="text-muted-foreground mb-6">
                  This is a demo checkout. In production, this would integrate with PayChangu for secure payments.
                </p>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <Field>
                    <FieldLabel htmlFor="cardName">Cardholder Name</FieldLabel>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardInfo.cardName}
                      onChange={(e) =>
                        setCardInfo({ ...cardInfo, cardName: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="cardNumber">Card Number</FieldLabel>
                    <Input
                      id="cardNumber"
                      placeholder="4532 1234 5678 9010"
                      value={cardInfo.cardNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\s/g, '');
                        if (value.length <= 16 && /^\d*$/.test(value)) {
                          value = value.match(/.{1,4}/g)?.join(' ') || value;
                          setCardInfo({ ...cardInfo, cardNumber: value });
                        }
                      }}
                      required
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="expiry">Expiry Date</FieldLabel>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardInfo.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setCardInfo({ ...cardInfo, expiryDate: value });
                        }}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="cvv">CVV</FieldLabel>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardInfo.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                          setCardInfo({ ...cardInfo, cvv: value });
                        }}
                        required
                      />
                    </Field>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => setStep('details')}
                      variant="outline"
                      className="flex-1 h-12 text-base"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary hover:bg-primary/90 text-base h-12 font-semibold"
                    >
                      {loading ? 'Processing...' : 'Complete Payment'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {step === 'confirmation' && (
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl">✓</div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-muted-foreground mb-6">
                  Your tickets have been successfully booked.
                </p>

                <Card className="bg-muted p-6 mb-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-bold">{confirmationDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-bold">{confirmationDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-bold text-green-600">Confirmed</span>
                    </div>
                  </div>
                </Card>

                <p className="text-muted-foreground text-sm mb-6">
                  A confirmation email has been sent to <strong>{confirmationDetails.email}</strong>. 
                  Your tickets are ready to download.
                </p>

                <Button
                  onClick={handleFinish}
                  className="w-full bg-primary hover:bg-primary/90 text-base h-12 font-semibold"
                >
                  Return Home
                </Button>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20 p-6 bg-muted">
              <h3 className="font-bold mb-4">Order Summary</h3>

              <div className="space-y-4 pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">{event?.title || 'Loading event...'}</p>
                  <p className="text-sm font-semibold">1 Ticket × MWK {(event?.price || 0).toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>MWK {(event?.price || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span>MWK 500</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span className="text-primary">MWK {((event?.price || 0) + 500).toLocaleString()}</span>
              </div>

              <div className="mt-6 p-4 bg-background rounded-lg flex gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Your payment is secure and encrypted. All data is protected.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
