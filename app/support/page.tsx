'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { Mail, MessageSquare, Phone, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send support ticket to backend
    console.log('Support ticket:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="text-4xl font-bold tracking-tight">Customer Support</h1>
        <p className="text-muted-foreground text-lg mt-2">We're here to help. Get in touch with our support team.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Cards */}
          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Send us an email and we&apos;ll respond within 24 hours.
            </p>
            <a href="mailto:support@zosavuta.com" className="text-primary font-medium hover:underline">
              support@zosavuta.com
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Call us Monday to Friday, 9 AM to 5 PM EAT.
            </p>
            <a href="tel:+254700000000" className="text-primary font-medium hover:underline">
              +254 700 000 000
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Chat Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Message us on WhatsApp for quick assistance.
            </p>
            <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
              Start Chat
            </a>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Thank you! Your message has been sent.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="subject">Subject</FieldLabel>
              <Input
                id="subject"
                placeholder="e.g., Issue with booking"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <Textarea
                id="message"
                placeholder="Please describe your issue or question in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="min-h-40"
                required
              />
            </Field>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-base h-12 font-semibold">
              Send Message
            </Button>
          </form>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-bold mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const FAQ_ITEMS = [
  {
    question: 'Can I refund my tickets?',
    answer: 'Tickets are non-refundable. However, Zosavuta offers an official Marketplace where you can safely resell your tickets to other fans if you can no longer attend an event.',
  },
  {
    question: 'Can I change my ticket quantity?',
    answer: 'You can increase or decrease your ticket quantity up to 3 days before the event. Visit your booking details and select "Modify Booking".',
  },
  {
    question: 'How does bus transport work?',
    answer: 'If you select round-trip transport, we arrange buses to pick you up and drop you off at designated locations. Details will be sent to your email after purchase.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including card payments (Visa, Mastercard), mobile money (M-Pesa), and bank transfers through our secure PayChangu payment gateway.',
  },
  {
    question: 'How do I download my tickets?',
    answer: 'After purchase, your tickets will be available in your account under "My Bookings". You can download them as PDF or display them directly on your phone at the venue.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes! We use industry-standard encryption and our payment processing is handled by PayChangu, a PCI-DSS compliant payment processor.',
  },
];
