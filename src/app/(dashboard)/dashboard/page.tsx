"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, UserCheck, UserMinus, UserPlus, Phone, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useVisitors } from "@/hooks/useVisitors";
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimeString } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Add Operator Dialog ─────────────────────────────────────────────────────
function AddOperatorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName]     = useState("");
  const [phone, setPhone]   = useState("");
  const [email, setEmail]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add operator");
      setFeedback({ type: "success", message: `"${name.trim()}" added as operator!` });
      setName(""); setPhone(""); setEmail("");
      // Auto-close after 1.5s on success
      setTimeout(() => { onOpenChange(false); setFeedback(null); }, 1500);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setName(""); setPhone(""); setEmail(""); setFeedback(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Add New Operator</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Register an entry operator for the VMS
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Full Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Input
              placeholder="e.g. Ravi Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Phone <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              type="email"
              placeholder="operator@paryatan.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            }`}>
              {feedback.type === "success"
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <AlertCircle className="h-4 w-4 shrink-0" />}
              {feedback.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()} className="gap-2 min-w-[120px]">
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                : <><UserPlus className="h-4 w-4" /> Add Operator</>
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { visitors, loading, error } = useVisitors();
  const [addOperatorOpen, setAddOperatorOpen] = useState(false);

  const totalVisitors   = visitors.length;
  const vehiclesInside  = visitors.filter((v) => v.status === "Inside").length;
  const activeVisitors  = vehiclesInside;
  const exitedVisitors  = visitors.filter((v) => v.status === "Exited").length;

  const recent = [...visitors]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button
          onClick={() => setAddOperatorOpen(true)}
          className="gap-2 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow"
        >
          <UserPlus className="h-4 w-4" />
          Add Operator
        </Button>
      </div>

      {/* Add Operator Dialog */}
      <AddOperatorDialog open={addOperatorOpen} onOpenChange={setAddOperatorOpen} />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : totalVisitors}</div>
            <p className="text-xs text-muted-foreground">+{totalVisitors} total today</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Inside</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : vehiclesInside}</div>
            <p className="text-xs text-muted-foreground">{vehiclesInside} active slots</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : activeVisitors}</div>
            <p className="text-xs text-muted-foreground">Currently inside premises</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exited Visitors</CardTitle>
            <UserMinus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : exitedVisitors}</div>
            <p className="text-xs text-muted-foreground">Completed visits today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Recent */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[300px] flex items-center justify-center text-muted-foreground border-t border-border/50 bg-black/20 rounded-b-xl">
            <div className="flex flex-col items-center gap-4">
              <OverviewChart visitors={visitors} />
              <StatusPieChart visitors={visitors} />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Recent Visitors</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto border-t border-border/50 bg-black/20 rounded-b-xl p-2">
            {loading && <p className="text-muted-foreground">Loading...</p>}
            {error && <p className="text-destructive">Error: {error}</p>}
            {!loading && !error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.vehicleNumber || "-"}</TableCell>
                      <TableCell>
                        {v.status === "Inside" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 font-medium px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.15)] animate-pulse">
                            Inside
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-500/10 text-slate-600 border border-slate-500/10 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800/50 font-medium px-2 py-0.5 rounded-full">
                            Exited
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatTimeString(v.entryTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
