"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Send, CheckCircle, Archive, Copy, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendInvoice, updateInvoiceStatus, duplicateInvoice } from "@/actions/invoices";

interface Invoice {
  id: string;
  status: string;
}

interface InvoiceActionsProps {
  invoice: Invoice;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();

  const handleSend = async () => {
    const result = await sendInvoice(invoice.id);
    if (result.success) {
      alert("Invoice sent successfully");
      router.refresh();
    } else {
      alert(result.error || "Failed to send invoice");
    }
  };

  const handleMarkPaid = async () => {
    const result = await updateInvoiceStatus(invoice.id, 'paid');
    if (result.success) {
      alert("Invoice marked as paid");
      router.refresh();
    } else {
      alert(result.error || "Failed to update invoice");
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this invoice?")) return;
    
    const result = await updateInvoiceStatus(invoice.id, 'archived');
    if (result.success) {
      alert("Invoice archived");
      router.refresh();
    } else {
      alert(result.error || "Failed to archive invoice");
    }
  };

  const handleDuplicate = async () => {
    const result = await duplicateInvoice(invoice.id);
    if (result.success) {
      alert("Invoice duplicated successfully");
      router.push("/dashboard/invoices");
    } else {
      alert(result.error || "Failed to duplicate invoice");
    }
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert("PDF download functionality coming soon");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
        {invoice.status === 'draft' && (
          <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {invoice.status !== 'paid' && invoice.status !== 'archived' && invoice.status !== 'sent' && (
          <DropdownMenuItem onClick={handleSend} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
            <Send className="mr-2 h-4 w-4" />
            Send
          </DropdownMenuItem>
        )}
        {invoice.status !== 'paid' && invoice.status !== 'archived' && (
          <DropdownMenuItem onClick={handleMarkPaid} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Paid
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDownload} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        {invoice.status !== 'archived' && (
          <DropdownMenuItem onClick={handleArchive} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

