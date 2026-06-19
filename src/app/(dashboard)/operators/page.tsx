import OperatorManagement from "@/components/dashboard/operator-management";
import { ShieldCheck } from "lucide-react";

export default function OperatorsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operator Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Add and manage entry operators for the Visitor Management System
          </p>
        </div>
      </div>

      <OperatorManagement />
    </div>
  );
}
