"use client";

import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Check, Clock, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { VisitorDetailsModal } from "@/components/dashboard/visitor-details-modal";
import { formatTimeString } from "@/lib/utils";
import { BeautifulLoader } from "@/components/ui/loader";

export type Visitor = {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  personToMeet: string;
  vehicleNumber: string;
  entryTime: string;
  exitTime: string | null;
  status: "Inside" | "Exited";
  createdAt?: string;
  enteredBy?: string; // Operator name who entered
};

const mockData: Visitor[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    phone: "+91 9876543210",
    purpose: "Interview",
    personToMeet: "HR Dept",
    vehicleNumber: "MH 12 AB 1234",
    entryTime: "10:30 AM",
    exitTime: null,
    status: "Inside",
  },
  {
    id: "2",
    name: "Priya Singh",
    phone: "+91 9123456780",
    purpose: "Vendor Meeting",
    personToMeet: "Admin",
    vehicleNumber: "-",
    entryTime: "09:15 AM",
    exitTime: "11:45 AM",
    status: "Exited",
  },
  {
    id: "3",
    name: "Amit Patel",
    phone: "+91 9988776655",
    purpose: "Delivery",
    personToMeet: "Reception",
    vehicleNumber: "GJ 01 XX 9999",
    entryTime: "11:00 AM",
    exitTime: null,
    status: "Inside",
  },
];



export default function VisitorListPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [data, setData] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
const [exitLoadingId, setExitLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/visitors");
        if (!response.ok) throw new Error("Failed to fetch");
        const json = await response.json();
        const responseData = Array.isArray(json) ? json : (json.data || []);
        setData(responseData);
      } catch (error) {
        console.error(error);
        // If the API fails, show no visitors instead of mock data
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const columns: ColumnDef<Visitor>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Visitor ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <span className="font-mono text-xs font-semibold text-muted-foreground">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
    },
    {
      accessorKey: "personToMeet",
      header: "Meeting With",
    },
    {
      accessorKey: "vehicleNumber",
      header: "Vehicle No.",
    },
    {
      accessorKey: "entryTime",
      header: "Entry Time",
      cell: ({ row }) => formatTimeString(row.getValue("entryTime")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return status === "Inside" ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 font-medium px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.15)] animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            Inside
          </Badge>
        ) : (
          <Badge className="bg-slate-500/10 text-slate-600 border border-slate-500/10 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800/50 font-medium px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3 mr-1" />
            Exited
          </Badge>
        );
      },
    },
    {
      accessorKey: "enteredBy",
      header: "Entered By",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const visitor = row.original;
  
        // Function to mark exit for a visitor
          const handleMarkExit = async (id: string) => {
            try {
              setExitLoadingId(id);
              const resp = await fetch('/api/visitors/exit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
              });
              if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error || 'Failed to mark exit');
              }
              // Refresh data after successful exit
              const refreshed = await fetch('/api/visitors');
              const json = await refreshed.json();
              const responseData = Array.isArray(json) ? json : (json.data || []);
              setData(responseData);
            } catch (e: any) {
              console.error(e);
              alert(e.message || 'Unable to mark exit. Please try again.');
            } finally {
              setExitLoadingId(null);
            }
          };

        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground outline-none">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(visitor.id)}>
                    Copy visitor ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedVisitor(visitor)}>View details</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {visitor.status === "Inside" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkExit(visitor.id)}
                disabled={exitLoadingId === visitor.id}
              >
                {exitLoadingId === visitor.id && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Mark Exit
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Visitors List</h1>
      </div>
      
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter names..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex-1" />
        <Button variant="outline">Today</Button>
        <Button variant="outline">This Week</Button>
      </div>

      <div className="glass-card rounded-md border-none overflow-hidden text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center border-none"
                >
                  <div className="flex items-center justify-center py-8">
                    <BeautifulLoader text="Syncing from DataBase..." />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      
      <VisitorDetailsModal 
        isOpen={selectedVisitor !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedVisitor(null);
        }}
        visitor={selectedVisitor}
      />
    </div>
  );
}
