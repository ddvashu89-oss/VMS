"use client";

import { useState, useMemo } from "react";
import { useVisitors } from "@/hooks/useVisitors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BeautifulLoader } from "@/components/ui/loader";
import { Search, User, Phone, Car, Clock, CalendarDays, History, AlertCircle, Hash } from "lucide-react";
import { formatTimeString } from "@/lib/utils";

export default function VisitorLookupPage() {
  const [searchId, setSearchId] = useState("");
  const [submittedSearchId, setSubmittedSearchId] = useState("");
  const { visitors, loading } = useVisitors();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearchId(searchId.trim());
  };

  // Find all visits matching the Visitor ID
  const matches = useMemo(() => {
    if (!submittedSearchId) return [];
    const cleanId = submittedSearchId.trim().toUpperCase();
    return visitors.filter((v) => v.id && v.id.trim().toUpperCase() === cleanId);
  }, [visitors, submittedSearchId]);

  // Sort visits in reverse chronological order (newest first)
  const sortedVisits = useMemo(() => {
    return [...matches].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [matches]);

  const latestVisit = sortedVisits[0] || null;

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visitor Lookup</h1>
        <p className="text-muted-foreground mt-2">
          Track returning visitor frequency and historical records using their Visitor ID.
        </p>
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-lg">Search Visitor Profile</CardTitle>
          <CardDescription>Enter the Visitor ID assigned during their initial registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g. PARVIS-1001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" className="btn-glow">
              <Search className="w-4 h-4 mr-2" /> Lookup
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <BeautifulLoader text="Syncing database records..." />
        </div>
      ) : submittedSearchId ? (
        matches.length > 0 && latestVisit ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats and Info Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Card */}
              <Card className="glass-card border-none md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Visitor Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Full Name</span>
                    <p className="font-semibold text-lg">{latestVisit.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Visitor ID</span>
                    <p className="font-mono text-sm font-semibold text-primary">{latestVisit.id}</p>
                  </div>
                  <div className="space-y-1 flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Phone</span>
                      <p className="font-medium">{latestVisit.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-1 flex items-center gap-3">
                    <Car className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Vehicle Number</span>
                      <p className="font-medium">{latestVisit.vehicleNumber || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Card */}
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Frequency Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-medium tracking-wider">Total Visits</span>
                    <div className="text-4xl font-extrabold text-gradient mt-1">{matches.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      times visited Paryatan Foundation.
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-medium tracking-wider">Current Status</span>
                    {latestVisit.status === "Inside" ? (
                      <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 font-medium px-2.5 py-1 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.15)] animate-pulse text-xs">
                        Inside
                      </Badge>
                    ) : (
                      <Badge className="mt-2 bg-slate-500/10 text-slate-600 border border-slate-500/10 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800/50 font-medium px-2.5 py-1 rounded-full text-xs">
                        Exited
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visit History Log */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Visits History
                </CardTitle>
                <CardDescription>Chronological log of all recorded visits under this ID.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Host (Meeting With)</TableHead>
                      <TableHead>Entry Time</TableHead>
                      <TableHead>Exit Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedVisits.map((visit, index) => (
                      <TableRow key={index} className="hover:bg-muted/10">
                        <TableCell className="font-medium text-sm">
                          {visit.createdAt ? new Date(visit.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </TableCell>
                        <TableCell>{visit.purpose}</TableCell>
                        <TableCell>{visit.personToMeet}</TableCell>
                        <TableCell>{formatTimeString(visit.entryTime)}</TableCell>
                        <TableCell>{formatTimeString(visit.exitTime)}</TableCell>
                        <TableCell>
                          {visit.status === "Inside" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 font-medium px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.15)] animate-pulse text-xs">
                              Inside
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-500/10 text-slate-600 border border-slate-500/10 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800/50 font-medium px-2 py-0.5 rounded-full text-xs">
                              Exited
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="glass-card border-none text-center py-12 animate-in fade-in duration-300">
            <CardContent className="space-y-3">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No Visitor Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                We couldn't find any visit logs matching Visitor ID <span className="font-mono font-semibold text-primary">"{submittedSearchId}"</span>.
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="glass-card border-none text-center py-16">
          <CardContent className="space-y-2">
            <div className="flex justify-center mb-2">
              <Search className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Waiting for search...</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Please enter a Visitor ID above to query their total visit frequency, host metrics, and history logs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
