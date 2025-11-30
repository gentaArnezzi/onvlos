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
  const clientsResult = await getClients(1, 1000);
  const clients = clientsResult.clients || [];
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
      case 'draft': return 'bg-[#EDEDED] font-primary text-[#606170]';
      case 'sent': return 'bg-[#EDEDED] text-[#0A33C6]';
      case 'viewed': return 'bg-[#EDEDED] text-[#0A33C6]';
      case 'accepted': return 'bg-emerald-100 text-emerald-700';
      case 'signed': return 'bg-emerald-100 text-emerald-700';
      case 'declined': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-orange-100 text-orange-700';
      default: return 'bg-[#EDEDED] font-primary text-[#606170]';
    }
  };

  // Stats
  const totalProposals = proposals.length;
  const sentProposals = proposals.filter(p => p.status === 'sent' || p.status === 'viewed').length;
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
  const totalValue = proposals.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0);

  return (
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("proposals.proposalsAndContracts", language)}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("proposals.description", language)}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg shadow-[#0A33C6]/20 border-0 font-primary font-bold">
              <Plus className="h-4 w-4 mr-2" />
              {t("proposals.newProposal", language)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-[#EDEDED]">
            <DialogHeader>
              <DialogTitle className="font-primary text-[#02041D]">{t("proposals.createNewProposal", language)}</DialogTitle>
            </DialogHeader>
            <ProposalEditor clients={clients} currencySymbol={defaultCurrencySymbol} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">{t("proposals.totalProposals", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] font-primary text-[#606170]">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{totalProposals}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">{t("proposals.allTimeCreated", language)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">{t("proposals.sentProposals", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Send className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{sentProposals}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">{t("proposals.awaitingResponse", language)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">{t("proposals.acceptedProposals", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <FileSignature className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{acceptedProposals}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">{t("proposals.successfullyClosed", language)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">{t("proposals.totalValue", language)}</CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{defaultCurrencySymbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">{t("proposals.potentialRevenue", language)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList className="border border-[#EDEDED] w-full sm:w-fit bg-white overflow-x-auto scrollbar-hide">
          <TabsTrigger value="proposals" className="data-[state=active]:bg-[#0A33C6] data-[state=active]:text-white font-primary text-[#606170] whitespace-nowrap flex-shrink-0">
            <FileText className="h-4 w-4 mr-2" />
            {t("proposals.title", language)}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-[#0A33C6] data-[state=active]:text-white font-primary text-[#606170] whitespace-nowrap flex-shrink-0">
            <FileSignature className="h-4 w-4 mr-2" />
            {t("proposals.contracts", language)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-0">
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-primary text-[#02041D]">{t("proposals.allProposals", language)}</CardTitle>
                <div className="relative w-64 hidden md:block">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 font-primary text-[#606170]" />
                  <Input placeholder="Search proposals..." className="pl-8 bg-[#EDEDED] border-none font-primary text-[#02041D] placeholder:font-primary text-[#606170]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-[#EDEDED] bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#EDEDED]">
                    <TableRow className="hover:bg-transparent border-[#EDEDED]">
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.proposalNumber", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.proposalTitle", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.client", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.amount", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.status", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.created", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.validUntil", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.actions", language)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center font-primary text-[#606170]">
                          {t("proposals.noProposals", language)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      proposals.map((proposal) => (
                        <TableRow key={proposal.id} className="hover:bg-[#EDEDED] transition-colors border-[#EDEDED] group">
                          <TableCell className="pl-6 py-4 font-medium font-primary text-[#02041D]">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-[#EDEDED] font-primary text-[#606170]">
                                <FileText className="h-4 w-4" />
                              </div>
                              {proposal.proposal_number}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium font-primary text-[#02041D]">{proposal.title}</TableCell>
                          <TableCell className="font-primary text-[#606170]">{proposal.client_name || '-'}</TableCell>
                          <TableCell className="font-bold font-primary text-[#02041D]">{defaultCurrencySymbol}{proposal.total || '0'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize font-medium border-0 px-2.5 py-0.5 ${getStatusBadgeClass(proposal.status)}`}>
                              {proposal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-primary text-[#606170]">
                            {proposal.created_at && format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="font-primary text-[#606170]">
                            {proposal.valid_until && format(new Date(proposal.valid_until), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                <Link href={`/proposal/${proposal.id}`} target="_blank">
                                  <Eye className="h-4 w-4 text-[#0A33C6]" />
                                </Link>
                              </Button>
                              {proposal.status === 'draft' && (
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Send className="h-4 w-4 text-[#0A33C6]" />
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
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-primary text-[#02041D]">{t("proposals.allContracts", language)}</CardTitle>
                <div className="relative w-64 hidden md:block">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 font-primary text-[#606170]" />
                  <Input placeholder="Search contracts..." className="pl-8 bg-[#EDEDED] border-none font-primary text-[#02041D] placeholder:font-primary text-[#606170]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-[#EDEDED] bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#EDEDED]">
                    <TableRow className="hover:bg-transparent border-[#EDEDED]">
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.contractNumber", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.proposalTitle", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.client", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.status", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.effectiveDate", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("proposals.fullySigned", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.actions", language)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center font-primary text-[#606170]">
                          {t("proposals.noContracts", language)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      contracts.map((contract) => (
                        <TableRow key={contract.id} className="hover:bg-[#EDEDED] transition-colors border-[#EDEDED] group">
                          <TableCell className="pl-6 py-4 font-medium font-primary text-[#02041D]">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-[#EDEDED] font-primary text-[#606170]">
                                <FileSignature className="h-4 w-4" />
                              </div>
                              {contract.contract_number}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium font-primary text-[#02041D]">{contract.title}</TableCell>
                          <TableCell className="font-primary text-[#606170]">{contract.client_name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize font-medium border-0 px-2.5 py-0.5 ${getStatusBadgeClass(contract.status)}`}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-primary text-[#606170]">
                            {contract.effective_date && format(new Date(contract.effective_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={contract.fully_signed ? "default" : "secondary"} className={contract.fully_signed ? "bg-emerald-100 text-emerald-700 border-0" : "bg-[#EDEDED] font-primary text-[#606170] border-0"}>
                              {contract.fully_signed ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                              <Link href={`/contract/${contract.id}`} target="_blank">
                                <Eye className="h-4 w-4 text-[#0A33C6]" />
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
