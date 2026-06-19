"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  Search, Bell, LogOut, ShieldCheck,
  UserPlus, Phone, Mail, Users, Loader2,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

// ─── Add Operator Dialog ─────────────────────────────────────────────────────
function AddAdminDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ name: name.trim(), phone, email, role: "admin" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add operator");
      setFeedback({ type: "success", message: `"${name.trim()}" admin added successfully!` });
      setName(""); setPhone(""); setEmail("");
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
      <DialogContent className="sm:max-w-md border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Add New Admin</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Register an entry admin for the VMS
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Full Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Input placeholder="e.g. Ravi Kumar" value={name}
              onChange={(e) => setName(e.target.value)} required disabled={submitting} autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Phone <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input placeholder="+91 98765 43210" value={phone}
              onChange={(e) => setPhone(e.target.value)} disabled={submitting} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input type="email" placeholder="operator@paryatan.org" value={email}
              onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
          </div>

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

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()} className="gap-2 min-w-[130px]">
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                : <><ShieldCheck className="h-4 w-4" /> Add Admin</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Top Navbar ──────────────────────────────────────────────────────────────
export function TopNavbar() {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  const initials = session?.user?.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <>
      <header className="sticky top-4 z-40 w-full px-4 lg:px-6 mb-4">
        <div className="flex h-14 items-center gap-3 glass rounded-2xl px-4 shadow-lg">

          {/* Left: sidebar toggle */}
          <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors shrink-0" />

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search visitors..."
              className="w-full bg-white/5 border-white/10 pl-8 h-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* ── Add Operator Button ── */}
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="gap-2 h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all duration-200 rounded-xl font-medium text-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Admin</span>
            <span className="sm:hidden">+Ad</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors shrink-0"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User avatar + dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors h-9 w-9 flex items-center justify-center outline-none border border-primary/30 shrink-0">
              <span className="font-bold text-xs">{initials}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-1">
              <div className="px-3 py-2 flex flex-col gap-0.5 border-b border-border/50 mb-1">
                <span className="font-semibold text-sm leading-tight">
                  {session?.user?.name ?? "Admin"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {session?.user?.email ?? "admin@paryatan.org"}
                </span>
              </div>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50 rounded-lg mx-1 mb-1"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Add Operator Dialog */}
      <AddAdminDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
