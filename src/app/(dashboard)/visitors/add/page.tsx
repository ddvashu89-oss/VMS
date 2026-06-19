"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const visitorSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  purpose: z.string().min(2, { message: "Please enter the purpose of visit." }),
  personToMeet: z.string().min(2, { message: "Please enter who they are meeting." }),
  vehicleNumber: z.string().min(2, { message: "Vehicle number is required." }),
  enteredBy: z.string().optional(),
  visitorId: z.string().optional(),
});

type VisitorFormValues = z.infer<typeof visitorSchema>;

export default function AddVisitorPage() {
  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      purpose: "",
      personToMeet: "",
      vehicleNumber: "",
      visitorId: "",
    },
  });

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVisitors, setExistingVisitors] = useState<any[]>([]);
  const [matchedVisitor, setMatchedVisitor] = useState<any | null>(null);
  const [operators, setOperators] = useState<any[]>([]);

  // Fetch visitors on mount for auto-association lookup
  useEffect(() => {
    async function loadVisitors() {
      try {
        const res = await fetch("/api/visitors");
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json.data || []);
          setExistingVisitors(list);
        }
      } catch (e) {
        console.error("Failed to load existing visitors for autocomplete", e);
      }
    }
    async function loadOperators() {
      try {
        const res = await fetch("/api/operators");
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json.data || []);
          setOperators(list);
        }
      } catch (e) {
        console.error("Failed to load operators", e);
      }
    }
    loadVisitors();
    loadOperators();
  }, []);

  const phoneValue = form.watch("phone");

  // Check phone value for returning visitor recognition
  useEffect(() => {
    if (!phoneValue || phoneValue.length < 10) {
      setMatchedVisitor(null);
      form.setValue("visitorId", "");
      return;
    }

    const cleanPhone = phoneValue.replace(/\s+/g, "").replace(/^\+91/, "");

    const match = existingVisitors.find((v) => {
      const vPhone = (v.phone || "").replace(/\s+/g, "").replace(/^\+91/, "");
      return vPhone && vPhone === cleanPhone;
    });

    if (match) {
      setMatchedVisitor(match);
      form.setValue("visitorId", match.id);
      
      // Prefill details if they aren't typed yet
      const currentName = form.getValues("fullName");
      const currentVehicle = form.getValues("vehicleNumber");
      
      if (!currentName) {
        form.setValue("fullName", match.name);
      }
      if (!currentVehicle || currentVehicle === "-") {
        form.setValue("vehicleNumber", match.vehicleNumber !== "-" ? match.vehicleNumber : "");
      }
    } else {
      setMatchedVisitor(null);
      form.setValue("visitorId", "");
    }
  }, [phoneValue, existingVisitors, form]);

  async function onSubmit(data: VisitorFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: data.visitorId || undefined,
          enteredBy: data.enteredBy,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save visitor");
      }

      alert("Visitor added successfully!");
      router.push("/visitors/list");
    } catch (error) {
      console.error(error);
      alert("Error adding visitor. Please check your configuration.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Visitor</h1>
          <p className="text-muted-foreground mt-2">
            Record visitor details and assign parking.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Visitor Information</CardTitle>
              <CardDescription>
                Personal details and purpose of visit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matchedVisitor && (
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">
                      ✨ Welcome back, <strong className="text-primary">{matchedVisitor.name}</strong>! Returning Visitor detected.
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30 bg-primary/5">
                    ID: {matchedVisitor.id}
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Operators dropdown */}
                <FormField
                  control={form.control}
                  name="enteredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entered By (Operator) *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Visit *</FormLabel>
                      <FormControl>
                        <Input placeholder="Meeting, Interview, Delivery..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personToMeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Person to Meet *</FormLabel>
                      <FormControl>
                        <Input placeholder="Employee Name / Department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Vehicle Information *</CardTitle>
              <CardDescription>
                Vehicle details are required for security and parking log.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="MH 12 AB 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" className="w-full sm:w-auto hover:bg-primary/10 hover:text-primary transition-colors">
              Print Pass
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto btn-glow">
              {isSubmitting ? "Saving..." : "Save Visitor"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
