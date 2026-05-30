'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangleIcon, UsersIcon, CalendarIcon, TrendingUpIcon, TicketIcon } from 'lucide-react';

const revenueData = [
  { date: '2026-01-01', revenue: 125000 },
  { date: '2026-01-08', revenue: 189000 },
  { date: '2026-01-15', revenue: 156000 },
  { date: '2026-01-22', revenue: 212000 },
  { date: '2026-01-29', revenue: 198000 },
  { date: '2026-02-05', revenue: 245000 },
];

const eventCategoryData = [
  { name: 'Music', value: 35, color: '#8B5CF6' },
  { name: 'Sports', value: 25, color: '#3B82F6' },
  { name: 'Conference', value: 20, color: '#10B981' },
  { name: 'Festival', value: 12, color: '#F59E0B' },
  { name: 'Workshop', value: 8, color: '#EF4444' },
];

const ticketSalesData = [
  { category: 'Music', sold: 1200, available: 800 },
  { category: 'Sports', sold: 950, available: 500 },
  { category: 'Conference', sold: 650, available: 350 },
  { category: 'Festival', sold: 780, available: 420 },
  { category: 'Workshop', sold: 320, available: 180 },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg mt-2">Platform analytics and management</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Alert Banner */}
        <Card className="p-4 bg-yellow-50 border-yellow-200 mb-8 flex gap-4">
          <AlertTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">Admin Dashboard</p>
            <p className="text-sm text-yellow-800 mt-1">
              This is a demo interface. In production, this would require proper authentication and authorization.
            </p>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<TrendingUpIcon className="w-6 h-6" />}
            label="Total Revenue"
            value="2.4M MWK"
          />
          <StatCard
            icon={<UsersIcon className="w-6 h-6" />}
            label="Total Users"
            value="12,543"
          />
          <StatCard
            icon={<CalendarIcon className="w-6 h-6" />}
            label="Active Events"
            value="156"
          />
          <StatCard
            icon={<TicketIcon className="w-6 h-6" />}
            label="Tickets Sold"
            value="45,230"
          />
        </div>

        {/* Analytics */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Revenue Trend</h3>
              {mounted ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" />
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
              ) : (
                <div className="h-[350px] w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm font-medium">
                  Loading charts...
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Events by Category</h3>
                {mounted ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eventCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm font-medium">
                    Loading charts...
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4">Top Events</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Afrobeats Music Festival', events: 35, growth: '+15%' },
                    { name: 'Tech Innovation Summit', events: 28, growth: '+8%' },
                    { name: 'Football Championship', events: 22, growth: '+5%' },
                    { name: 'Comedy Night', events: 18, growth: '-2%' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.events} events</p>
                      </div>
                      <span className={`text-sm font-semibold ${item.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {item.growth}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Ticket Sales by Category</h3>
              {mounted ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={ticketSalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sold" fill="var(--color-primary)" />
                    <Bar dataKey="available" fill="var(--color-muted)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm font-medium">
                  Loading charts...
                </div>
              )}
            </Card>
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
