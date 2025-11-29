import { getInvoices } from "@/actions/invoices";
import { getClients } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import { format } from "date-fns";
import { CreateInvoiceDialog } from "@/components/dashboard/invoices/create-invoice-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const clients = await getClients();

  // Calculate stats
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'pending');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

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
          <div className="flex items-center justify-between">
            <CardTitle>Invoice History</CardTitle>
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search invoices..." className="pl-8 bg-slate-50 dark:bg-slate-900/50 border-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                  <TableHead className="pl-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice #</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</TableHead>
                  <TableHead className="text-right pr-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800 group">
                      <TableCell className="pl-6 py-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          {invoice.invoice_number}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium">
                        {invoice.client_name || "Unknown Client"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                                capitalize font-medium border-0 px-2.5 py-0.5
                                ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                                ${invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                                ${invoice.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                ${invoice.status === 'draft' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' : ''}
                            `}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-bold text-slate-900 dark:text-white">
                        ${Number(invoice.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
