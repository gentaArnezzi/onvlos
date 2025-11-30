"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Search, MoreVertical, Eye, Edit, Send, CheckCircle, Archive, Copy, Download } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { updateInvoiceStatus, sendInvoice, duplicateInvoice } from "@/actions/invoices";
import { getCurrencySymbol } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n/context";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: string;
  currency?: string | null;
  status: string;
  due_date: string | null;
  client_name: string | null;
  client_company_name: string | null;
  created_at: Date | null;
}

interface InvoicesListProps {
  initialInvoices: Invoice[];
  clients: { id: string; name: string; company_name: string | null }[];
}

export function InvoicesList({ initialInvoices, clients }: InvoicesListProps) {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  // Helper function to translate status
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      "draft": t("invoices.draft"),
      "sent": t("invoices.sent"),
      "paid": t("invoices.paid"),
      "overdue": t("invoices.overdue"),
      "archived": t("invoices.archived"),
      "pending": t("invoices.pending") || "Pending",
    };
    return statusMap[status] || status;
  };

  // Filter invoices
  useEffect(() => {
    let filtered = initialInvoices;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(query) ||
        inv.client_name?.toLowerCase().includes(query) ||
        inv.client_company_name?.toLowerCase().includes(query)
      );
    }

    setInvoices(filtered);
  }, [searchQuery, statusFilter, initialInvoices]);

  const handleView = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  const handleEdit = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}/edit`);
  };

  const handleSend = async (invoiceId: string) => {
    const result = await sendInvoice(invoiceId);
    if (result.success) {
      alert(t("invoices.invoiceSent"));
      router.refresh();
    } else {
      alert(result.error || t("invoices.failedToSend"));
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    const result = await updateInvoiceStatus(invoiceId, 'paid');
    if (result.success) {
      alert(t("invoices.invoiceMarkedPaid"));
      router.refresh();
    } else {
      alert(result.error || t("invoices.failedToUpdate"));
    }
  };

  const handleArchive = async (invoiceId: string) => {
    if (!confirm(t("invoices.archiveConfirm"))) return;
    
    const result = await updateInvoiceStatus(invoiceId, 'archived');
    if (result.success) {
      alert(t("invoices.invoiceArchived"));
      router.refresh();
    } else {
      alert(result.error || t("invoices.failedToArchive"));
    }
  };

  const handleDuplicate = async (invoiceId: string) => {
    const result = await duplicateInvoice(invoiceId);
    if (result.success) {
      alert(t("invoices.invoiceDuplicated"));
      router.refresh();
    } else {
      alert(result.error || t("invoices.failedToDuplicate"));
    }
  };

  const handleDownload = async (invoiceId: string) => {
    // TODO: Implement PDF download
    alert(t("common.comingSoon") || "PDF download functionality coming soon");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder={t("invoices.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-900">
              <SelectValue placeholder={t("invoices.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("invoices.allStatus")}</SelectItem>
              <SelectItem value="draft">{t("invoices.draft")}</SelectItem>
              <SelectItem value="sent">{t("invoices.sent")}</SelectItem>
              <SelectItem value="paid">{t("invoices.paid")}</SelectItem>
              <SelectItem value="overdue">{t("invoices.overdue")}</SelectItem>
              <SelectItem value="archived">{t("invoices.archived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("invoices.invoiceNumber")}</TableHead>
              <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("invoices.client")}</TableHead>
              <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("invoices.status")}</TableHead>
              <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("invoices.dueDate")}</TableHead>
              <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("invoices.amount")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <CreditCard className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {searchQuery || statusFilter !== "all" ? t("invoices.noInvoices") : t("invoices.noInvoicesYet")}
                    </h3>
                    <p className="text-sm text-slate-600 mb-6 max-w-md text-center">
                      {searchQuery || statusFilter !== "all" 
                        ? t("invoices.tryAdjustingSearch")
                        : t("invoices.createFirstInvoice")}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <CreateInvoiceDialog clients={clients} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50 transition-colors border-slate-100 group">
                  <TableCell className="pl-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <button
                        onClick={() => handleView(invoice.id)}
                        className="hover:text-emerald-600 transition-colors"
                      >
                        {invoice.invoice_number}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {invoice.client_company_name || invoice.client_name || t("invoices.unknownClient")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                        capitalize font-medium border-0 px-2.5 py-0.5
                        ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : ''}
                        ${invoice.status === 'pending' ? 'bg-orange-100 text-orange-700' : ''}
                        ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' : ''}
                        ${invoice.status === 'draft' ? 'bg-slate-100 text-slate-700' : ''}
                        ${invoice.status === 'archived' ? 'bg-gray-100 text-gray-700' : ''}
                      `}
                    >
                      {translateStatus(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right pr-6 font-bold text-slate-900">
                    {getCurrencySymbol(invoice.currency)}{Number(invoice.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-900">
                        <DropdownMenuItem onClick={() => handleView(invoice.id)} className="text-slate-900 hover:bg-slate-100">
                          <Eye className="mr-2 h-4 w-4" />
                          {t("invoices.view")}
                        </DropdownMenuItem>
                        {invoice.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleEdit(invoice.id)} className="text-slate-900 hover:bg-slate-100">
                            <Edit className="mr-2 h-4 w-4" />
                            {t("invoices.edit")}
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'paid' && invoice.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => handleSend(invoice.id)} className="text-slate-900 hover:bg-slate-100">
                            <Send className="mr-2 h-4 w-4" />
                            {t("invoices.send")}
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'paid' && invoice.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => handleMarkPaid(invoice.id)} className="text-slate-900 hover:bg-slate-100">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t("invoices.markAsPaid")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDownload(invoice.id)} className="text-slate-900 hover:bg-slate-100">
                          <Download className="mr-2 h-4 w-4" />
                          {t("invoices.downloadPDF")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(invoice.id)} className="text-slate-900 hover:bg-slate-100">
                          <Copy className="mr-2 h-4 w-4" />
                          {t("invoices.duplicate")}
                        </DropdownMenuItem>
                        {invoice.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => handleArchive(invoice.id)} className="text-red-600 hover:bg-red-50">
                            <Archive className="mr-2 h-4 w-4" />
                            {t("invoices.archive")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

