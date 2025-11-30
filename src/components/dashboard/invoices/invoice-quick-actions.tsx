"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, Download } from "lucide-react";
import { sendInvoice, updateInvoiceStatus } from "@/actions/invoices";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Invoice {
  id: string;
  status: string;
  client?: {
    id?: string;
  } | null;
}

interface InvoiceQuickActionsProps {
  invoice: Invoice;
}

export function InvoiceQuickActions({ invoice }: InvoiceQuickActionsProps) {
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

  const handleDownload = () => {
    // TODO: Implement PDF download
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  return (
    <>
      {/* Quick Actions */}
      <Card className="border-none shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {invoice.status === 'draft' && (
            <Button 
              onClick={handleSend}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
          )}
          {invoice.status !== 'paid' && invoice.status !== 'archived' && (
            <Button 
              onClick={handleMarkPaid}
              variant="outline"
              className="w-full border-slate-200 text-slate-900 bg-white hover:bg-slate-50"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="w-full border-slate-200 text-slate-900 bg-white hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Payment Info */}
      {(invoice.status === 'sent' || invoice.status === 'overdue') && invoice.client?.id && (
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/portal/${invoice.client.id}/invoices/${invoice.id}/payment`}>
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white">
                View Payment Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
}

