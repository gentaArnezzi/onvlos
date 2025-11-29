"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MoreVertical, 
  ExternalLink, 
  FileText, 
  CheckSquare, 
  Zap, 
  Archive,
  Users,
  Trash2,
  Loader2,
  Filter,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteClient, updateClient } from "@/actions/clients";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateInvoiceDialog } from "@/components/dashboard/invoices/create-invoice-dialog";
import { CreateTaskDialog } from "@/components/dashboard/tasks/create-task-dialog";

interface Client {
  id: string;
  name: string;
  email: string | null;
  company_name: string | null;
  category: string | null;
  description: string | null;
  status: string | null;
  logo_url?: string | null;
  contract_value: string | null;
  owner_user_id: string | null;
  created_at: Date | string | null;
  space_public_url?: string | null;
  task_count?: number;
  invoice_count?: number;
}

interface ClientsGridProps {
  clients: Client[];
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  lead: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  onboarding: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  archived: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export function ClientsGrid({ clients: initialClients }: ClientsGridProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created");
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedClientForAction, setSelectedClientForAction] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(clients.map(c => c.category).filter(Boolean)));

  // Filter and sort clients
  const filteredClients = clients
    .filter((client) => {
      const matchesSearch = 
        client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || client.status === filterStatus;
      const matchesCategory = filterCategory === "all" || client.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.company_name || a.name).localeCompare(b.company_name || b.name);
        case "updated":
          const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return bUpdated - aUpdated;
        case "value":
          const aValue = parseFloat(a.contract_value || "0");
          const bValue = parseFloat(b.contract_value || "0");
          return bValue - aValue;
        case "created":
        default:
          const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bCreated - aCreated;
      }
    });

  const handleDelete = async (clientId: string) => {
    setLoading(true);
    const result = await deleteClient(clientId);
    if (result.success) {
      setClients(clients.filter(c => c.id !== clientId));
      setDeletingClientId(null);
    } else {
      alert("Failed to delete client");
    }
    setLoading(false);
  };

  const handleArchive = async (clientId: string) => {
    setLoading(true);
    const result = await updateClient(clientId, { status: "archived" });
    if (result.success) {
      setClients(clients.map(c => c.id === clientId ? { ...c, status: "archived" } : c));
      router.refresh();
    }
    setLoading(false);
  };

  // Calculate engagement percentage (based on tasks and invoices)
  const getEngagement = (client: Client) => {
    const taskCount = client.task_count || 0;
    const invoiceCount = client.invoice_count || 0;
    // Simple engagement: 50% tasks, 50% invoices (max 10 each = 100%)
    const engagement = Math.min(100, (taskCount * 5) + (invoiceCount * 5));
    return engagement;
  };

  return (
    <>
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search clients by name, email, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="text-slate-900 dark:text-white">All Status</SelectItem>
              <SelectItem value="active" className="text-slate-900 dark:text-white">Active</SelectItem>
              <SelectItem value="lead" className="text-slate-900 dark:text-white">Lead</SelectItem>
              <SelectItem value="onboarding" className="text-slate-900 dark:text-white">Onboarding</SelectItem>
              <SelectItem value="completed" className="text-slate-900 dark:text-white">Completed</SelectItem>
              <SelectItem value="archived" className="text-slate-900 dark:text-white">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="text-slate-900 dark:text-white">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat || ""} className="text-slate-900 dark:text-white">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem value="created" className="text-slate-900 dark:text-white">Newest</SelectItem>
              <SelectItem value="updated" className="text-slate-900 dark:text-white">Recently Updated</SelectItem>
              <SelectItem value="name" className="text-slate-900 dark:text-white">Name</SelectItem>
              <SelectItem value="value" className="text-slate-900 dark:text-white">Contract Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Cards */}
      {filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const engagement = getEngagement(client);
            const initials = (client.company_name || client.name)
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2);

            return (
              <Card
                key={client.id}
                className="group relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <AvatarImage src={client.logo_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {client.company_name || "No Company"}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {client.name}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                        {client.space_public_url && (
                          <DropdownMenuItem asChild className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700">
                            <Link href={`/portal/${client.space_public_url}`} target="_blank" className="cursor-pointer flex items-center">
                              <ExternalLink className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                              Open Space
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedClientForAction(client.id);
                            setInvoiceDialogOpen(true);
                          }}
                          className="cursor-pointer text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          <FileText className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                          New Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedClientForAction(client.id);
                            setTaskDialogOpen(true);
                          }}
                          className="cursor-pointer text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          <CheckSquare className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                          New Task
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700">
                          <Link href={`/dashboard/funnels`} className="cursor-pointer flex items-center">
                            <Zap className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                            Start Funnel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                        <DropdownMenuItem
                          onClick={() => handleArchive(client.id)}
                          className="cursor-pointer text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingClientId(client.id)}
                          className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Category Badge */}
                  {client.category && (
                    <div className="mb-3">
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      >
                        {client.category}
                      </Badge>
                    </div>
                  )}

                  {/* Description */}
                  {client.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {client.description}
                    </p>
                  )}

                  {/* Engagement Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Engagement</span>
                      <span className="text-xs text-slate-500 dark:text-slate-500">{engagement}%</span>
                    </div>
                    <Progress value={engagement} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      <span>{client.task_count || 0} tasks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{client.invoice_count || 0} invoices</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        statusColors[client.status || "lead"] || statusColors.lead
                      )}
                    >
                      {client.status || "lead"}
                    </Badge>
                    {client.created_at && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(client.created_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery || filterStatus !== "all" || filterCategory !== "all" 
                ? "No clients found" 
                : "No clients yet"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md text-center">
              {searchQuery || filterStatus !== "all" || filterCategory !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first client."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        clients={clients.map(c => ({ id: c.id, name: c.name, company_name: c.company_name }))}
        initialClientId={selectedClientForAction || undefined}
        open={invoiceDialogOpen}
        onOpenChange={(open) => {
          setInvoiceDialogOpen(open);
          if (!open) {
            setSelectedClientForAction(null);
            router.refresh();
          }
        }}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        clients={clients.map(c => ({ id: c.id, name: c.name, company_name: c.company_name }))}
        initialClientId={selectedClientForAction || undefined}
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setSelectedClientForAction(null);
            router.refresh();
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingClientId} onOpenChange={(open) => !open && setDeletingClientId(null)}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Delete Client</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this client? This action cannot be undone.
              All related data (portal, conversations, files) will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingClientId(null)}
              className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingClientId && handleDelete(deletingClientId)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

