"use client";

import { useState, useMemo } from "react";
import { useVisitors } from "@/hooks/useVisitors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { BeautifulLoader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const MOCK_DATA = {
  day: {
    footfall: [
      { time: "09:00", visitors: 12 },
      { time: "10:00", visitors: 25 },
      { time: "11:00", visitors: 30 },
      { time: "12:00", visitors: 15 },
      { time: "13:00", visitors: 8 },
      { time: "14:00", visitors: 22 },
      { time: "15:00", visitors: 35 },
      { time: "16:00", visitors: 40 },
      { time: "17:00", visitors: 10 },
    ],
    purpose: [
      { name: "Meeting", value: 45 },
      { name: "Delivery", value: 20 },
      { name: "Interview", value: 15 },
      { name: "Maintenance", value: 10 },
      { name: "Other", value: 10 },
    ]
  },
  month: {
    footfall: [
      { time: "Week 1", visitors: 250 },
      { time: "Week 2", visitors: 310 },
      { time: "Week 3", visitors: 280 },
      { time: "Week 4", visitors: 340 },
    ],
    purpose: [
      { name: "Meeting", value: 480 },
      { name: "Delivery", value: 320 },
      { name: "Interview", value: 150 },
      { name: "Maintenance", value: 120 },
      { name: "Other", value: 110 },
    ]
  },
  year: {
    footfall: [
      { time: "Jan", visitors: 1200 },
      { time: "Feb", visitors: 1350 },
      { time: "Mar", visitors: 1500 },
      { time: "Apr", visitors: 1420 },
      { time: "May", visitors: 1600 },
      { time: "Jun", visitors: 1550 },
      { time: "Jul", visitors: 1700 },
      { time: "Aug", visitors: 1800 },
      { time: "Sep", visitors: 1650 },
      { time: "Oct", visitors: 1500 },
      { time: "Nov", visitors: 1400 },
      { time: "Dec", visitors: 1300 },
    ],
    purpose: [
      { name: "Meeting", value: 6500 },
      { name: "Delivery", value: 3800 },
      { name: "Interview", value: 2500 },
      { name: "Maintenance", value: 2000 },
      { name: "Other", value: 3170 },
    ]
  }
};

const COLORS = ['#06B6D4', '#22C55E', '#3B82F6', '#EAB308', '#EF4444'];

export default function ReportsPage() {
  const [filter, setFilter] = useState<"day" | "month" | "year">("day");
  const { visitors, loading } = useVisitors();

  const data = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Helper to get hour from time string
    function getHourFromTime(timeStr: string): number | null {
      if (!timeStr) return null;
      const clean = timeStr.trim().toUpperCase();
      
      const matchAmpm = clean.match(/(\d+):(\d+)\s*(AM|PM)/);
      if (matchAmpm) {
        let hour = parseInt(matchAmpm[1], 10);
        const isPm = matchAmpm[3] === "PM";
        if (isPm && hour !== 12) hour += 12;
        if (!isPm && hour === 12) hour = 0;
        return hour;
      }
      
      const match24 = clean.match(/^(\d+):(\d+)/);
      if (match24) {
        return parseInt(match24[1], 10);
      }
      
      return null;
    }

    if (filter === "day") {
      // 1. Filter today's visitors
      const todayVisitors = visitors.filter(v => {
        if (!v.createdAt) return false;
        const d = new Date(v.createdAt);
        return !isNaN(d.getTime()) && 
               d.getDate() === today.getDate() &&
               d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear;
      });

      // 2. Compute Footfall (8:00 AM to 8:00 PM)
      const footfall = [
        { time: "8:00 AM", visitors: 0 },
        { time: "9:00 AM", visitors: 0 },
        { time: "10:00 AM", visitors: 0 },
        { time: "11:00 AM", visitors: 0 },
        { time: "12:00 PM", visitors: 0 },
        { time: "1:00 PM", visitors: 0 },
        { time: "2:00 PM", visitors: 0 },
        { time: "3:00 PM", visitors: 0 },
        { time: "4:00 PM", visitors: 0 },
        { time: "5:00 PM", visitors: 0 },
        { time: "6:00 PM", visitors: 0 },
        { time: "7:00 PM", visitors: 0 },
        { time: "8:00 PM", visitors: 0 },
      ];

      todayVisitors.forEach(v => {
        const hour = getHourFromTime(v.entryTime);
        if (hour !== null) {
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          const bucketTime = `${displayHour}:00 ${ampm}`;
          const bucket = footfall.find(b => b.time === bucketTime);
          if (bucket) {
            bucket.visitors += 1;
          }
        }
      });

      // 3. Compute Purpose
      const purposeCounts: Record<string, number> = {};
      todayVisitors.forEach(v => {
        const p = v.purpose ? v.purpose.trim() : "Other";
        purposeCounts[p] = (purposeCounts[p] || 0) + 1;
      });
      
      let purpose = Object.keys(purposeCounts).map(name => ({
        name,
        value: purposeCounts[name]
      }));

      if (purpose.length === 0) {
        purpose = [{ name: "No Data", value: 0 }];
      }

      return { footfall, purpose };
    }

    if (filter === "month") {
      // 1. Filter this month's visitors
      const monthVisitors = visitors.filter(v => {
        if (!v.createdAt) return false;
        const d = new Date(v.createdAt);
        return !isNaN(d.getTime()) &&
               d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear;
      });

      // 2. Compute Footfall by Week
      const footfall = [
        { time: "Week 1", visitors: 0 },
        { time: "Week 2", visitors: 0 },
        { time: "Week 3", visitors: 0 },
        { time: "Week 4", visitors: 0 },
      ];

      monthVisitors.forEach(v => {
        if (!v.createdAt) return;
        const d = new Date(v.createdAt);
        if (isNaN(d.getTime())) return;
        const day = d.getDate();
        if (day <= 7) footfall[0].visitors += 1;
        else if (day <= 14) footfall[1].visitors += 1;
        else if (day <= 21) footfall[2].visitors += 1;
        else footfall[3].visitors += 1;
      });

      // 3. Compute Purpose
      const purposeCounts: Record<string, number> = {};
      monthVisitors.forEach(v => {
        const p = v.purpose ? v.purpose.trim() : "Other";
        purposeCounts[p] = (purposeCounts[p] || 0) + 1;
      });

      let purpose = Object.keys(purposeCounts).map(name => ({
        name,
        value: purposeCounts[name]
      }));

      if (purpose.length === 0) {
        purpose = [{ name: "No Data", value: 0 }];
      }

      return { footfall, purpose };
    }

    // Default: Year filter
    // 1. Filter this year's visitors
    const yearVisitors = visitors.filter(v => {
      if (!v.createdAt) return false;
      const d = new Date(v.createdAt);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear;
    });

    // 2. Compute Footfall by Month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const footfall = months.map(m => ({ time: m, visitors: 0 }));

    yearVisitors.forEach(v => {
      if (!v.createdAt) return;
      const d = new Date(v.createdAt);
      if (isNaN(d.getTime())) return;
      const monthIdx = d.getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        footfall[monthIdx].visitors += 1;
      }
    });

    // 3. Compute Purpose
    const purposeCounts: Record<string, number> = {};
    yearVisitors.forEach(v => {
      const p = v.purpose ? v.purpose.trim() : "Other";
      purposeCounts[p] = (purposeCounts[p] || 0) + 1;
    });

    let purpose = Object.keys(purposeCounts).map(name => ({
      name,
      value: purposeCounts[name]
    }));

    if (purpose.length === 0) {
      purpose = [{ name: "No Data", value: 0 }];
    }

    return { footfall, purpose };
  }, [visitors, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] w-full animate-in fade-in duration-300">
        <BeautifulLoader text="Loading report analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-2">
            Monitor visitor footfall and trends with interactive charts.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl glass h-14">
          <Button 
            variant={filter === "day" ? "default" : "ghost"} 
            onClick={() => setFilter("day")}
            className={`rounded-xl transition-all duration-300 h-full font-medium px-5 ${filter === "day" ? 'bg-primary/15 text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)] border-primary/30 border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Today
          </Button>
          <Button 
            variant={filter === "month" ? "default" : "ghost"} 
            onClick={() => setFilter("month")}
            className={`rounded-xl transition-all duration-300 h-full font-medium px-5 ${filter === "month" ? 'bg-primary/15 text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)] border-primary/30 border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            This Month
          </Button>
          <Button 
            variant={filter === "year" ? "default" : "ghost"} 
            onClick={() => setFilter("year")}
            className={`rounded-xl transition-all duration-300 h-full font-medium px-5 ${filter === "year" ? 'bg-primary/15 text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)] border-primary/30 border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            This Year
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Daily Visitor Report</CardTitle>
            <CardDescription>Download a summary of all visitors for a specific day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="flex items-center gap-2">
                <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button className="w-full hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors" variant="outline">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
              </Button>
              <Button className="w-full btn-glow">
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Custom Range Report</CardTitle>
            <CardDescription>Download visitor data over a custom date range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visitors</SelectItem>
                  <SelectItem value="vehicles">With Vehicles</SelectItem>
                  <SelectItem value="overstayed">Overstayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4 pt-2">
              <Button className="w-full hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors" variant="outline">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
              </Button>
              <Button className="w-full btn-glow">
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Footfall Chart */}
        <Card className="glass-card lg:col-span-2 border-none min-w-0">
          <CardHeader>
            <CardTitle>Visitor Footfall</CardTitle>
            <CardDescription>Number of visitors over the selected {filter}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.footfall} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#A1A1AA" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#A1A1AA" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <RechartsTooltip 
                    cursor={{fill: '#27272A'}}
                    contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#27272A', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#FAFAFA' }}
                  />
                  <Bar 
                    dataKey="visitors" 
                    fill="#06B6D4" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Purpose Distribution Chart */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Visit Purpose</CardTitle>
            <CardDescription>Distribution for the selected {filter}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.purpose}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {data.purpose.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#27272A', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#FAFAFA' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
