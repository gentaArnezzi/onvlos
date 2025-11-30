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
      <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#0731c2] to-[#010119] bg-clip-text text-transparent">
              {contract.title}
            </h2>
            <p className="text-slate-600 mt-1">
              {contract.contract_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isFullySigned && (
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t("contracts.status.signed", language)}
              </Badge>
            )}
            {isSigned && !isFullySigned && (
              <Badge className="bg-blue-100 text-blue-700 border-0">
                <FileSignature className="h-3 w-3 mr-1" />
                {t("contracts.status.signed", language)}
              </Badge>
            )}
            {isCancelled && (
              <Badge className="bg-red-100 text-red-700 border-0">
                <XCircle className="h-3 w-3 mr-1" />
                {t("contracts.status.cancelled", language)}
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t("contracts.status.completed", language)}
              </Badge>
            )}
            {contract.status === "draft" && (
              <Badge className="bg-slate-100 text-slate-700 border-0">
                <FileText className="h-3 w-3 mr-1" />
                {t("contracts.status.draft", language)}
              </Badge>
            )}
            {(contract.status === "sent" || contract.status === "viewed") && !isSigned && !isFullySigned && (
              <Badge className="bg-blue-100 text-blue-700 border-0">
                <Clock className="h-3 w-3 mr-1" />
                {contract.status === "sent" ? t("contracts.status.sent", language) : t("contracts.status.viewed", language)}
              </Badge>
            )}
          </div>
        </div>

        {/* Client Info Card */}
        {client && (
          <Card className="border-none shadow-lg bg-white relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    {t("contracts.client", language)}
                  </p>
                  <p className="font-semibold text-slate-900">
                    {client.company_name || client.name}
                  </p>
                  {client.email && (
                    <p className="text-sm text-slate-600">
                      {client.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Content */}
        <ContractViewClient 
          contract={{
            ...contract,
            content: contract.content || { sections: [] },
            parties: Array.isArray(contract.parties) ? contract.parties : []
          }}
        />
      </div>
    </LanguageProviderWrapper>
  );
}

