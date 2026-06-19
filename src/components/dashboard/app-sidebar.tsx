"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, UserPlus, FileText, Settings, Search, ShieldCheck, Loader2, Phone, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const items = [
  { title: "Dashboard",     url: "/dashboard",      icon: LayoutDashboard },
  { title: "Visitors",      url: "/visitors/list",  icon: Users           },
  { title: "Visitor Lookup",url: "/visitors/lookup",icon: Search          },
  { title: "Add Visitor",   url: "/visitors/add",   icon: UserPlus        },
  { title: "Reports",       url: "/reports",        icon: FileText        },
  { title: "Settings",      url: "/settings",       icon: Settings        },
];

// ─── Add Operator Dialog ─────────────────────────────────────────────────────
function AddOperatorDialog({
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
        body: JSON.stringify({ name: name.trim(), phone, email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add operator");
      setFeedback({ type: "success", message: `"${name.trim()}" added successfully!` });
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
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
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
              required disabled={submitting} autoFocus
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
              type="email" placeholder="operator@paryatan.org"
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

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()} className="gap-2 min-w-[120px]">
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                : <><ShieldCheck className="h-4 w-4" /> Add Operator</>
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Sidebar className="border-none mt-4 mb-4 ml-4 rounded-2xl overflow-hidden shadow-2xl dark:shadow-blue-900/10 glass-sidebar h-[calc(100vh-2rem)]">
        <SidebarContent className="bg-transparent">
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary font-bold text-xl mb-6 mt-4 flex items-center justify-center tracking-tight text-gradient">
              Paryatan VMS
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        tooltip={item.title}
                        className={`transition-all duration-300 rounded-xl px-3 py-6 ${isActive ? "bg-primary/10 text-primary font-semibold shadow-inner" : "hover:bg-primary/5 hover:text-primary hover:translate-x-1 text-muted-foreground"}`}
                      >
                        <item.icon className={isActive ? "text-primary" : ""} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Add Operator button pinned at sidebar bottom ── */}
        <SidebarFooter className="px-3 pb-4 pt-2 border-t border-white/10">
          <Button
            onClick={() => setDialogOpen(true)}
            className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none rounded-xl transition-all duration-200 hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.25)]"
            variant="ghost"
          >
            <ShieldCheck className="h-4 w-4" />
            Add Operator
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Dialog renders outside sidebar so it covers full screen */}
      <AddOperatorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
