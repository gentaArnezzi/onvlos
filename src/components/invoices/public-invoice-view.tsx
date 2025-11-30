"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/currency";
import { format } from "date-fns";
import { createStripePaymentIntent } from "@/actions/invoices";
import { useState } from "react";
import { Loader2, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePDF, sendInvoiceEmail } from "@/actions/invoices";

interface PublicInvoiceViewProps {
  invoice: any;
}

export function PublicInvoiceView({ invoice }: PublicInvoiceViewProps) {
  const [processing, setProcessing] = useState(false);
  const currencySymbol = getCurrencySymbol(invoice.currency || "USD");

  const handlePay = async () => {
    setProcessing(true);
    try {
      const result = await createStripePaymentIntent(invoice.id);
      if (result.success && result.clientSecret) {
        // TODO: Redirect to Stripe Checkout or show payment form
        // For now, just show a message
        toast.success("Redirecting to payment...");
        // window.location.href = `/checkout?client_secret=${result.clientSecret}`;
      } else {
        toast.error(result.error || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error("Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    setProcessing(true);
    try {
      const result = await generateInvoicePDF(invoice.id);
      if (result.success && result.pdf) {
        // TODO: Download actual PDF
        toast.success("PDF generated");
      } else {
        toast.error(result.error || "Failed to generate PDF");
      }
    } catch (error) {
      toast.error("Failed to download PDF");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold font-primary text-[#02041D]">
              Invoice {invoice.invoice_number}
            </CardTitle>
            <p className="text-sm font-primary text-[#606170] mt-1">
              {invoice.client?.name || invoice.client?.company_name || "Client"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={processing}
              className="font-primary"
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            {invoice.status !== 'paid' && (
              <Button
                onClick={handlePay}
                disabled={processing || invoice.status === 'paid'}
                className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${currencySymbol}${parseFloat(invoice.total_amount || '0').toLocaleString()}`
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium font-primary text-[#606170]">Issue Date</p>
            <p className="font-primary text-[#02041D]">
              {invoice.issued_date ? format(new Date(invoice.issued_date), "MMM d, yyyy") : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium font-primary text-[#606170]">Due Date</p>
            <p className="font-primary text-[#02041D]">
              {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "-"}
            </p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-4">Items</h3>
          <div className="space-y-2">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between py-2 border-b border-[#EDEDED]">
                  <div>
                    <p className="font-medium font-primary text-[#02041D]">{item.name}</p>
                    <p className="text-sm font-primary text-[#606170]">
                      {item.quantity} x {currencySymbol}{parseFloat(item.unit_price || '0').toLocaleString()}
                    </p>
                  </div>
                  <p className="font-medium font-primary text-[#02041D]">
                    {currencySymbol}{(item.quantity * parseFloat(item.unit_price || '0')).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="font-primary text-[#606170]">No items</p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-[#EDEDED] pt-4 space-y-2">
          <div className="flex justify-between font-primary text-[#606170]">
            <span>Subtotal</span>
            <span>{currencySymbol}{parseFloat(invoice.amount_subtotal || '0').toLocaleString()}</span>
          </div>
          {invoice.discount_amount && parseFloat(invoice.discount_amount) > 0 && (
            <div className="flex justify-between font-primary text-[#606170]">
              <span>Discount</span>
              <span className="text-red-600">
                -{currencySymbol}{parseFloat(invoice.discount_amount).toLocaleString()}
              </span>
            </div>
          )}
          {invoice.tax_amount && parseFloat(invoice.tax_amount) > 0 && (
            <div className="flex justify-between font-primary text-[#606170]">
              <span>Tax</span>
              <span>{currencySymbol}{parseFloat(invoice.tax_amount).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold font-primary text-[#02041D] pt-2 border-t border-[#EDEDED]">
            <span>Total</span>
            <span className="text-[#0A33C6]">
              {currencySymbol}{parseFloat(invoice.total_amount || '0').toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-[#EDEDED] pt-4">
            <p className="text-sm font-medium font-primary text-[#606170] mb-2">Notes</p>
            <p className="font-primary text-[#02041D]">{invoice.notes}</p>
          </div>
        )}

        {/* Retainer Info */}
        {invoice.invoice_type === 'retainer' && invoice.retainer_schedule && (
          <div className="border-t border-[#EDEDED] pt-4">
            <p className="text-sm font-medium font-primary text-[#606170] mb-2">Recurring Schedule</p>
            <p className="font-primary text-[#02041D]">
              {JSON.parse(invoice.retainer_schedule).frequency} (Every {JSON.parse(invoice.retainer_schedule).interval})
            </p>
            {invoice.autopay_enabled && (
              <p className="text-sm font-primary text-[#0A33C6] mt-2">Autopay Enabled</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

