import { getInvoices } from "@/actions/invoices";
import { getClients } from "@/actions/clients";
import { CreateInvoiceDialog } from "@/components/dashboard/invoices/create-invoice-dialog";
import { InvoicesList } from "@/components/dashboard/invoices/invoices-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle, Clock } from "lucide-react";

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const clients = await getClients();

  // Calculate stats - filter out archived invoices
  const activeInvoices = invoices.filter(inv => inv.status !== 'archived');
  const totalRevenue = activeInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const paidInvoices = activeInvoices.filter(inv => inv.status === 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const pendingInvoices = activeInvoices.filter(inv => inv.status === 'sent' || inv.status === 'pending' || inv.status === 'draft');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const overdueInvoices = activeInvoices.filter(inv => inv.status === 'overdue');

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Invoices
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your billing and financial records.
          </p>
        </div>
        <CreateInvoiceDialog clients={clients} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All time invoiced amount
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Paid
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${paidAmount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {paidInvoices.length} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pending
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {pendingInvoices.length} invoices pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicesList initialInvoices={invoices} clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
