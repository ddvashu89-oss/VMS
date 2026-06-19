"use client";

import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell,
} from "@/components/ui/table";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, Users, Phone, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

interface Operator {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export default function OperatorManagement() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function fetchOperators() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/operators");
      if (!res.ok) throw new Error("Failed to fetch operators");
      const json = await res.json();
      setOperators(Array.isArray(json) ? json : json.data ?? []);
    } catch (e) {
      console.error(e);
      setOperators([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchOperators(); }, []);

  async function handleAddOperator(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, email }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add user");

      setFeedback({ type: "success", message: `User "${name.trim()}" added successfully!` });
      setName("");
      setPhone("");
      setEmail("");
      // Refresh the operators list
      await fetchOperators();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setIsSubmitting(false);
      // Auto-clear feedback after 4s
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Add Operator Form ── */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Add New User</CardTitle>
              <CardDescription>Register a new user for the VMS</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOperator} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Ravi Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone
                </label>
                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}>
                {feedback.type === "success"
                  ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                  : <AlertCircle className="h-4 w-4 shrink-0" />}
                {feedback.message}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !name.trim()} className="gap-2">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Add User</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Users List ── */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Registered Users</CardTitle>
                <CardDescription>{operators.length} user{operators.length !== 1 ? "s" : ""} registered</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {operators.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : operators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Users className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">No users registered yet</p>
              <p className="text-xs opacity-60">Use the form above to add the first user.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{op.id}</TableCell>
                    <TableCell className="font-medium">{op.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{op.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{op.email || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
