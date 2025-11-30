import { getInvoicePaymentDetails } from "@/actions/payments";
import { PaymentForm } from "@/components/portal/payment-form";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "@/lib/currency";

export default async function PaymentPage({ params }: { params: Promise<{ slug: string, invoiceId: string }> }) {
  // Await params in Next.js 15+
  const { invoiceId } = await params;
  const invoice = await getInvoicePaymentDetails(invoiceId);

  if (!invoice) return notFound();

  const currencySymbol = getCurrencySymbol(invoice.currency || 'USD');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
        <Card className="w-full max-w-md border-none shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-white text-xl">Secure Payment</CardTitle>
                <CardDescription className="text-emerald-100">
                    Invoice #{invoice.invoice_number}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Total Amount</span>
                    <span className="text-3xl font-bold text-slate-900">
                        {currencySymbol}{Number(invoice.total_amount).toLocaleString()}
                    </span>
                </div>
                
                {invoice.status === 'paid' ? (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center font-medium border border-emerald-200">
                        This invoice has already been paid.
                    </div>
                ) : (
                    <PaymentForm invoiceId={invoice.id} amount={invoice.total_amount} currency={invoice.currency || "IDR"} />
                )}
            </CardContent>
        </Card>
        
        <div className="mt-8 flex items-center justify-center space-x-4 opacity-60">
             {/* Payment Gateway Logos */}
             <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center">
                <span className="text-xs text-slate-600">SSL</span>
             </div>
             <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center">
                <span className="text-xs text-slate-600">PCI</span>
             </div>
             <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center">
                <span className="text-xs text-slate-600">256</span>
             </div>
        </div>
    </div>
  );
}
