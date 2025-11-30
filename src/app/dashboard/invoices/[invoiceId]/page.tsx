import { getInvoiceById } from "@/actions/invoices";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Send, CheckCircle, Edit } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { InvoiceActions } from "@/components/dashboard/invoices/invoice-actions";
import { InvoiceQuickActions } from "@/components/dashboard/invoices/invoice-quick-actions";
import { getCurrencySymbol } from "@/lib/currency";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    notFound();
  }
  
  const currencySymbol = getCurrencySymbol(invoice.currency || 'USD');

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon" className="font-primary text-[#606170] hover:font-primary text-[#02041D]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-primary text-[#0A33C6]">
              {invoice.invoice_number}
            </h2>
            <p className="font-primary text-[#606170] mt-1">
              Invoice Details
            </p>
          </div>
        </div>
        <InvoiceActions invoice={invoice} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Info */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-primary text-[#02041D]">Invoice Information</CardTitle>
                <Badge
                  variant="outline"
                  className={`
                    capitalize font-medium border-0 px-2.5 py-0.5
                    ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : ''}
                    ${invoice.status === 'sent' ? 'bg-[#EDEDED] text-[#0A33C6]' : ''}
                    ${invoice.status === 'draft' ? 'bg-[#EDEDED] font-primary text-[#606170]' : ''}
                    ${invoice.status === 'archived' ? 'bg-[#EDEDED] font-primary text-[#606170]' : ''}
                  `}
                >
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-primary text-[#606170] mb-1">Bill To</p>
                  <p className="font-semibold font-primary text-[#02041D]">
                    {invoice.client?.company_name || invoice.client?.name || "Unknown Client"}
                  </p>
                  {invoice.client?.email && (
                    <p className="text-sm font-primary text-[#606170] mt-1">
                      {invoice.client.email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-primary text-[#606170] mb-1">Invoice Details</p>
                  <div className="space-y-1">
                    <p className="text-sm font-primary text-[#02041D]">
                      <span className="font-primary text-[#606170]">Issued:</span>{" "}
                      {invoice.issued_date ? format(new Date(invoice.issued_date), "MMM d, yyyy") : "-"}
                    </p>
                    <p className="text-sm font-primary text-[#02041D]">
                      <span className="font-primary text-[#606170]">Due:</span>{" "}
                      {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "-"}
                    </p>
                    {invoice.paid_date && (
                      <p className="text-sm font-primary text-[#02041D]">
                        <span className="font-primary text-[#606170]">Paid:</span>{" "}
                        {format(new Date(invoice.paid_date), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-[#EDEDED] pt-6">
                <h3 className="font-semibold font-primary text-[#02041D] mb-4">Items</h3>
                <div className="rounded-lg border border-[#EDEDED] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#EDEDED]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium font-primary text-[#606170] uppercase" uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium font-primary text-[#606170] uppercase" uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium font-primary text-[#606170] uppercase" uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium font-primary text-[#606170] uppercase" uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDEDED]">
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, index) => (
                          <tr key={index} className="hover:bg-[#EDEDED]">
                            <td className="px-4 py-3 font-primary text-[#02041D]">{item.name}</td>
                            <td className="px-4 py-3 text-center font-primary text-[#606170]">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-primary text-[#606170]">
                              {currencySymbol}{Number(item.unit_price).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-medium font-primary text-[#02041D]">
                              {currencySymbol}{(item.quantity * Number(item.unit_price)).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center font-primary text-[#606170]">
                            No items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-[#EDEDED] pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm font-primary text-[#606170]">
                      <span>Subtotal:</span>
                      <span>{currencySymbol}{Number(invoice.amount_subtotal || 0).toLocaleString()}</span>
                    </div>
                    {invoice.discount_amount && Number(invoice.discount_amount) > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Discount:</span>
                        <span>-{currencySymbol}{Number(invoice.discount_amount).toLocaleString()}</span>
                      </div>
                    )}
                    {invoice.tax_amount && Number(invoice.tax_amount) > 0 && (
                      <div className="flex justify-between text-sm font-primary text-[#606170]">
                        <span>Tax ({invoice.tax_rate}%):</span>
                        <span>{currencySymbol}{Number(invoice.tax_amount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold font-primary text-[#02041D] pt-2 border-t border-[#EDEDED]">
                      <span>Total:</span>
                      <span className="text-[#0A33C6]">
                        {currencySymbol}{Number(invoice.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="border-t border-[#EDEDED] pt-6">
                  <h3 className="font-semibold font-primary text-[#02041D] mb-2">Notes</h3>
                  <p className="text-sm font-primary text-[#606170] whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InvoiceQuickActions invoice={invoice} />

        </div>
      </div>
    </div>
  );
}

