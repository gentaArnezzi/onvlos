import { getPublicInvoice } from "@/actions/invoices";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/currency";
import { format } from "date-fns";
import { createStripePaymentIntent } from "@/actions/invoices";
import { PublicInvoiceView } from "@/components/invoices/public-invoice-view";

export default async function PublicInvoicePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const invoice = await getPublicInvoice(slug);

  if (!invoice) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#EDEDED] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PublicInvoiceView invoice={invoice} />
      </div>
    </div>
  );
}

