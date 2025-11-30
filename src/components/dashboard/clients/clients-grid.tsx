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
import { useTranslation } from "@/lib/i18n/context";

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
  totalPages?: number;
  currentPage?: number;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  lead: "bg-orange-100 text-orange-700",
  onboarding: "bg-blue-100 text-blue-700",
  completed: "bg-slate-100 text-slate-700",
  archived: "bg-slate-100 text-slate-700",
};

export function ClientsGrid({ clients: initialClients, totalPages = 1, currentPage = 1 }: ClientsGridProps) {
  const { t } = useTranslation();
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
      alert(t("clients.failedToDelete"));
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
            placeholder={t("clients.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-900">
              <SelectValue placeholder={t("clients.status")} />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all" className="text-slate-900">{t("clients.allStatus")}</SelectItem>
              <SelectItem value="active" className="text-slate-900">{t("clients.active")}</SelectItem>
              <SelectItem value="lead" className="text-slate-900">{t("clients.lead")}</SelectItem>
              <SelectItem value="onboarding" className="text-slate-900">{t("clients.onboarding")}</SelectItem>
              <SelectItem value="completed" className="text-slate-900">{t("clients.completed")}</SelectItem>
              <SelectItem value="archived" className="text-slate-900">{t("clients.archived")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-900">
              <SelectValue placeholder={t("clients.category")} />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all" className="text-slate-900">{t("clients.allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat || ""} className="text-slate-900">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-900">
              <SelectValue placeholder={t("clients.sortBy")} />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="created" className="text-slate-900">{t("clients.newest")}</SelectItem>
              <SelectItem value="updated" className="text-slate-900">{t("clients.recentlyUpdated")}</SelectItem>
              <SelectItem value="name" className="text-slate-900">{t("clients.name")}</SelectItem>
              <SelectItem value="value" className="text-slate-900">{t("clients.contractValue")}</SelectItem>
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
                className="group relative overflow-hidden border-slate-200 bg-white hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-slate-200 flex-shrink-0">
                        <AvatarImage src={client.logo_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-[#0731c2] to-[#010119] text-white font-semibold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <h3 className="font-semibold text-slate-900 truncate hover:text-blue-600 transition-colors">
                            {client.company_name || t("clients.noCompany")}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-600 truncate">
                          {client.name}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-900"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-lg">
                        {client.space_public_url && (
                          <DropdownMenuItem asChild className="text-slate-900 hover:bg-slate-100 focus:bg-slate-100">
                            <Link href={`/portal/${client.space_public_url}`} target="_blank" className="cursor-pointer flex items-center">
                              <ExternalLink className="mr-2 h-4 w-4 text-slate-600" />
                              {t("clients.openSpace")}
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedClientForAction(client.id);
                            setInvoiceDialogOpen(true);
                          }}
                          className="cursor-pointer text-slate-900 hover:bg-slate-100 focus:bg-slate-100"
                        >
                          <FileText className="mr-2 h-4 w-4 text-slate-600" />
                          {t("clients.newInvoice")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedClientForAction(client.id);
                            setTaskDialogOpen(true);
                          }}
                          className="cursor-pointer text-slate-900 hover:bg-slate-100 focus:bg-slate-100"
                        >
                          <CheckSquare className="mr-2 h-4 w-4 text-slate-600" />
                          {t("clients.newTask")}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="text-slate-900 hover:bg-slate-100 focus:bg-slate-100">
                          <Link href={`/dashboard/funnels`} className="cursor-pointer flex items-center">
                            <Zap className="mr-2 h-4 w-4 text-slate-600" />
                            {t("clients.startFunnel")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200" />
                        <DropdownMenuItem
                          onClick={() => handleArchive(client.id)}
                          className="cursor-pointer text-slate-600 hover:bg-slate-100 focus:bg-slate-100"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          {t("clients.archive")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingClientId(client.id)}
                          className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("clients.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Category Badge */}
                  {client.category && (
                    <div className="mb-3">
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                      >
                        {client.category}
                      </Badge>
                    </div>
                  )}

                  {/* Description */}
                  {client.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {client.description}
                    </p>
                  )}

                  {/* Engagement Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{t("clients.engagement")}</span>
                      <span className="text-xs text-slate-600">{engagement}%</span>
                    </div>
                    <Progress value={engagement} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      <span>{client.task_count || 0} {t("clients.tasks")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{client.invoice_count || 0} {t("clients.invoices")}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
                      <span className="text-xs text-slate-600">
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
        <Card className="border-dashed border-slate-200 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery || filterStatus !== "all" || filterCategory !== "all" 
                ? t("clients.noClients") 
                : t("clients.noClientsYet")}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md text-center">
              {searchQuery || filterStatus !== "all" || filterCategory !== "all"
                ? t("clients.tryAdjustingSearch")
                : t("clients.getStartedByAdding")}
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
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{t("clients.deleteClient")}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {t("clients.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingClientId(null)}
              className="border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingClientId && handleDelete(deletingClientId)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("clients.deleting")}
                </>
              ) : (
                t("clients.deleteClient")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}

