import { getInvoices } from "@/actions/invoices";
import { getClients } from "@/actions/clients";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { CreateInvoiceDialog } from "@/components/dashboard/invoices/create-invoice-dialog";
import { InvoicesList } from "@/components/dashboard/invoices/invoices-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle, Clock } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { invoices, total, totalPages } = await getInvoices(params.search, params.status, page, 20);
  const allClientsResult = await getClients(1, 1000);
  const clients = allClientsResult.clients;
  const workspace = await getOrCreateWorkspace();
  const defaultCurrencySymbol = getCurrencySymbol(workspace?.default_currency || "USD");
  const language = (workspace?.default_language as Language) || "en";

  // Calculate stats - need all invoices for stats
  const allInvoicesResult = await getInvoices(undefined, undefined, 1, 1000);
  const activeInvoices = allInvoicesResult.invoices.filter(inv => inv.status !== 'archived');
  const totalRevenue = activeInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const paidInvoices = activeInvoices.filter(inv => inv.status === 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const pendingInvoices = activeInvoices.filter(inv => inv.status === 'sent' || inv.status === 'pending' || inv.status === 'draft');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const overdueInvoices = activeInvoices.filter(inv => inv.status === 'overdue');

  return (
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("invoices.title", language)}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("invoices.description", language)}
          </p>
        </div>
        <CreateInvoiceDialog clients={clients} defaultCurrency={workspace?.default_currency || "USD"} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("stats.totalRevenue", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">
              {defaultCurrencySymbol}{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("stats.allTimeInvoiced", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("stats.paid", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">
              {defaultCurrencySymbol}{paidAmount.toLocaleString()}
            </div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {paidInvoices.length} {t("stats.invoicesPaid", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("stats.pending", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">
              {defaultCurrencySymbol}{pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {pendingInvoices.length} {t("stats.invoicesPending", language)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="font-primary text-[#02041D]">{t("stats.invoiceHistory", language)}</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicesList initialInvoices={invoices} clients={clients} totalPages={totalPages} currentPage={page} />
        </CardContent>
      </Card>
    </div>
  );
}
