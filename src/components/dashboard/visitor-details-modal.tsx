"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Briefcase, Car, Clock, CalendarDays, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatTimeString } from "@/lib/utils";

interface VisitorDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  visitor: any | null;
}

export function VisitorDetailsModal({ isOpen, onOpenChange, visitor }: VisitorDetailsProps) {
  if (!visitor) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto glass-card border-l-0">
        <SheetHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-2xl font-bold">{visitor.name}</SheetTitle>
              <SheetDescription className="text-base mt-1">Visitor ID: {visitor.id}</SheetDescription>
            </div>
            <Badge variant={visitor.status === "Inside" ? "default" : "secondary"} className="text-sm px-3 py-1">
              {visitor.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact Info</h3>
            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-medium">{visitor.phone}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Visit Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{visitor.purpose}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Meeting With</p>
                  <p className="font-medium">{visitor.personToMeet}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Timings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Entry</p>
                  <p className="font-medium">{formatTimeString(visitor.entryTime)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Exit</p>
                  <p className="font-medium">{formatTimeString(visitor.exitTime)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Entry Operator</h3>
            <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Operator Name</p>
                <p className="font-medium">{visitor.enteredBy}</p>
              </div>
            </div>
          </div>

          {visitor.vehicleNumber !== "-" && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Vehicle Details</h3>
                <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <Car className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Number Plate</p>
                    <p className="font-medium">{visitor.vehicleNumber}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
