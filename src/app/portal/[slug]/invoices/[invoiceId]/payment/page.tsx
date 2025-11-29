import { getInvoicePaymentDetails } from "@/actions/payments";
import { PaymentForm } from "@/components/portal/payment-form";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PaymentPage({ params }: { params: { slug: string, invoiceId: string } }) {
  const invoice = await getInvoicePaymentDetails(params.invoiceId);

  if (!invoice) return notFound();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Secure Payment</CardTitle>
                <CardDescription>Invoice #{invoice.invoice_number}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-2xl font-bold">${Number(invoice.total_amount).toLocaleString()}</span>
                </div>
                
                {invoice.status === 'paid' ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium border border-green-200">
                        This invoice has already been paid.
                    </div>
                ) : (
                    <PaymentForm invoiceId={invoice.id} amount={invoice.total_amount} />
                )}
            </CardContent>
        </Card>
        
        <div className="mt-8 flex items-center justify-center space-x-4 opacity-50 grayscale">
             {/* Mock Logos */}
             <div className="h-8 w-12 bg-gray-200 rounded"></div>
             <div className="h-8 w-12 bg-gray-200 rounded"></div>
             <div className="h-8 w-12 bg-gray-200 rounded"></div>
        </div>
    </div>
  );
}
