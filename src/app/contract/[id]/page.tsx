import { getContractByIdOrSlug } from "@/actions/proposals";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "@/lib/currency";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, FileText, Building2, FileSignature } from "lucide-react";
import { ContractViewClient } from "@/components/contracts/contract-view-client";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";
import { LanguageProviderWrapper } from "@/components/language-provider-wrapper";
import { db } from "@/lib/db";
import { workspaces, client_companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ContractPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const contract = await getContractByIdOrSlug(id);

  if (!contract) {
    notFound();
  }

  // Get workspace from contract to get correct language and currency settings
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, contract.workspace_id)
  });
  
  // Get client information (already included in contract, but ensure it exists)
  const client = contract.client || await db.query.client_companies.findFirst({
    where: eq(client_companies.id, contract.client_id)
  });
  
  const language = (workspace?.default_language as Language) || "en";
  // Always use workspace default currency, fallback to USD
  const currency = workspace?.default_currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);
  const isFullySigned = contract.fully_signed;
  const isSigned = contract.status === "signed";
  const isCancelled = contract.status === "cancelled";
  const isCompleted = contract.status === "completed";

  return (
    <LanguageProviderWrapper defaultLanguage={language}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            {/* Client Info Banner */}
            {client && (
              <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("contracts.client", language)}
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {client.company_name || client.name}
                    </p>
                    {client.email && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {client.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {contract.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {contract.contract_number}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isFullySigned && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t("contracts.status.signed", language)}
                  </Badge>
                )}
                {isSigned && !isFullySigned && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    <FileSignature className="h-3 w-3 mr-1" />
                    {t("contracts.status.signed", language)}
                  </Badge>
                )}
                {isCancelled && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                    <XCircle className="h-3 w-3 mr-1" />
                    {t("contracts.status.cancelled", language)}
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t("contracts.status.completed", language)}
                  </Badge>
                )}
                {contract.status === "draft" && (
                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">
                    <FileText className="h-3 w-3 mr-1" />
                    {t("contracts.status.draft", language)}
                  </Badge>
                )}
                {(contract.status === "sent" || contract.status === "viewed") && !isSigned && !isFullySigned && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {contract.status === "sent" ? t("contracts.status.sent", language) : t("contracts.status.viewed", language)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contract Content */}
          <ContractViewClient 
            contract={{
              ...contract,
              content: contract.content || { sections: [] },
              parties: Array.isArray(contract.parties) ? contract.parties : []
            }}
          />
        </div>
      </div>
    </LanguageProviderWrapper>
  );
}

