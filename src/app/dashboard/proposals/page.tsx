import { getProposals, getContracts } from "@/actions/proposals";
import { getClients } from "@/actions/clients";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { ProposalEditor } from "@/components/proposals/proposal-editor";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, Send, FileText, FileSignature, CheckCircle2, Clock, XCircle, Search, FileCheck } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { getCurrencySymbol } from "@/lib/currency";

export default async function ProposalsPage() {
  const proposals = await getProposals();
  const contracts = await getContracts();
  const clients = await getClients();
  const workspace = await getOrCreateWorkspace();
  const defaultCurrencySymbol = getCurrencySymbol(workspace?.default_currency || "USD");
  const language = (workspace?.default_language as Language) || "en";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default'; // blue
      case 'viewed': return 'outline';
      case 'accepted': return 'default'; // emerald
      case 'signed': return 'default'; // emerald
      case 'declined': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'viewed': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'signed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'declined': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'expired': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  // Stats
  const totalProposals = proposals.length;
  const sentProposals = proposals.filter(p => p.status === 'sent' || p.status === 'viewed').length;
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
  const totalValue = proposals.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            {t("proposals.proposalsAndContracts", language)}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("proposals.description", language)}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white shadow-lg shadow-fuchsia-500/20 border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t("proposals.newProposal", language)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">{t("proposals.createNewProposal", language)}</DialogTitle>
            </DialogHeader>
            <ProposalEditor clients={clients} currencySymbol={defaultCurrencySymbol} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("proposals.totalProposals", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalProposals}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("proposals.allTimeCreated", language)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Send className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("proposals.sentProposals", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Send className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{sentProposals}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("proposals.awaitingResponse", language)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileSignature className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("proposals.acceptedProposals", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <FileSignature className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{acceptedProposals}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("proposals.successfullyClosed", language)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("proposals.totalValue", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{defaultCurrencySymbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("proposals.potentialRevenue", language)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList className="glass-card border-0 w-fit bg-slate-100 dark:bg-slate-800/50">
          <TabsTrigger value="proposals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300">
            <FileText className="h-4 w-4 mr-2" />
            {t("proposals.title", language)}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300">
            <FileSignature className="h-4 w-4 mr-2" />
            {t("proposals.contracts", language)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-0">
          <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white">{t("proposals.allProposals", language)}</CardTitle>
                <div className="relative w-64 hidden md:block">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input placeholder="Search proposals..." className="pl-8 bg-slate-50 dark:bg-slate-900/50 border-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                      <TableHead className="pl-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.proposalNumber", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.proposalTitle", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("table.client", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("table.amount", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("table.status", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.created", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.validUntil", language)}</TableHead>
                      <TableHead className="text-right pr-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("table.actions", language)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-slate-500 dark:text-slate-400">
                          {t("proposals.noProposals", language)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      proposals.map((proposal) => (
                        <TableRow key={proposal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800 group">
                          <TableCell className="pl-6 py-4 font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                <FileText className="h-4 w-4" />
                              </div>
                              {proposal.proposal_number}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-white">{proposal.title}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">{proposal.client_name || '-'}</TableCell>
                          <TableCell className="font-bold text-slate-900 dark:text-white">{defaultCurrencySymbol}{proposal.total || '0'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize font-medium border-0 px-2.5 py-0.5 ${getStatusBadgeClass(proposal.status)}`}>
                              {proposal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">
                            {proposal.created_at && format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">
                            {proposal.valid_until && format(new Date(proposal.valid_until), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                <Link href={`/proposal/${proposal.id}`} target="_blank">
                                  <Eye className="h-4 w-4 text-blue-500" />
                                </Link>
                              </Button>
                              {proposal.status === 'draft' && (
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Send className="h-4 w-4 text-fuchsia-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-0">
          <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white">{t("proposals.allContracts", language)}</CardTitle>
                <div className="relative w-64 hidden md:block">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input placeholder="Search contracts..." className="pl-8 bg-slate-50 dark:bg-slate-900/50 border-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                      <TableHead className="pl-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.contractNumber", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.proposalTitle", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("table.client", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("table.status", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.effectiveDate", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("proposals.fullySigned", language)}</TableHead>
                      <TableHead className="text-right pr-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("table.actions", language)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-slate-500 dark:text-slate-400">
                          {t("proposals.noContracts", language)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      contracts.map((contract) => (
                        <TableRow key={contract.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800 group">
                          <TableCell className="pl-6 py-4 font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                <FileSignature className="h-4 w-4" />
                              </div>
                              {contract.contract_number}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-white">{contract.title}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">{contract.client_name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize font-medium border-0 px-2.5 py-0.5 ${getStatusBadgeClass(contract.status)}`}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">
                            {contract.effective_date && format(new Date(contract.effective_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={contract.fully_signed ? "default" : "secondary"} className={contract.fully_signed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0"}>
                              {contract.fully_signed ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                              <Link href={`/contract/${contract.id}`} target="_blank">
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
