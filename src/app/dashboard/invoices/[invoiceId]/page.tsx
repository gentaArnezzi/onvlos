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
    <div className="flex-1 space-y-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {invoice.invoice_number}
            </h2>
            <p className="text-slate-600 mt-1">
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
                <CardTitle className="text-slate-900">Invoice Information</CardTitle>
                <Badge
                  variant="outline"
                  className={`
                    capitalize font-medium border-0 px-2.5 py-0.5
                    ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : ''}
                    ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' : ''}
                    ${invoice.status === 'draft' ? 'bg-slate-100 text-slate-700' : ''}
                    ${invoice.status === 'archived' ? 'bg-gray-100 text-gray-700' : ''}
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
                  <p className="text-sm text-slate-600 mb-1">Bill To</p>
                  <p className="font-semibold text-slate-900">
                    {invoice.client?.company_name || invoice.client?.name || "Unknown Client"}
                  </p>
                  {invoice.client?.email && (
                    <p className="text-sm text-slate-600 mt-1">
                      {invoice.client.email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Invoice Details</p>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-900">
                      <span className="text-slate-600">Issued:</span>{" "}
                      {invoice.issued_date ? format(new Date(invoice.issued_date), "MMM d, yyyy") : "-"}
                    </p>
                    <p className="text-sm text-slate-900">
                      <span className="text-slate-600">Due:</span>{" "}
                      {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "-"}
                    </p>
                    {invoice.paid_date && (
                      <p className="text-sm text-slate-900">
                        <span className="text-slate-600">Paid:</span>{" "}
                        {format(new Date(invoice.paid_date), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Items</h3>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase" uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase" uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase" uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase" uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-900">{item.name}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-600">
                              {currencySymbol}{Number(item.unit_price).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                              {currencySymbol}{(item.quantity * Number(item.unit_price)).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            No items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
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
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Tax ({invoice.tax_rate}%):</span>
                        <span>{currencySymbol}{Number(invoice.tax_amount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total:</span>
                      <span className="text-emerald-600">
                        {currencySymbol}{Number(invoice.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
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

