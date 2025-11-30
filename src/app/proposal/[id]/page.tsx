import { getProposalByIdOrSlug } from "@/actions/proposals";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/currency";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { ProposalViewClient } from "@/components/proposals/proposal-view-client";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";
import { LanguageProviderWrapper } from "@/components/language-provider-wrapper";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ProposalPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const proposal = await getProposalByIdOrSlug(id);

  if (!proposal) {
    notFound();
  }

  // Get workspace from proposal to get correct language and currency settings
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, proposal.workspace_id)
  });
  
  const language = (workspace?.default_language as Language) || "en";
  // Always use workspace default currency, fallback to USD
  const currency = workspace?.default_currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);
  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date();
  const isAccepted = proposal.status === "accepted";
  const isDeclined = proposal.status === "declined";

  return (
    <LanguageProviderWrapper defaultLanguage={language}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {proposal.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {proposal.proposal_number}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isAccepted && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t("proposals.status.accepted", language)}
                  </Badge>
                )}
                {isDeclined && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                    <XCircle className="h-3 w-3 mr-1" />
                    {t("proposals.status.declined", language)}
                  </Badge>
                )}
                {isExpired && !isAccepted && !isDeclined && (
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {t("proposals.status.expired", language)}
                  </Badge>
                )}
                {!isAccepted && !isDeclined && !isExpired && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    <FileText className="h-3 w-3 mr-1" />
                    {proposal.status === "draft" ? t("proposals.status.draft", language) : t("proposals.status.active", language)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Proposal Content */}
          <ProposalViewClient 
            proposal={{
              ...proposal,
              items: Array.isArray(proposal.items) ? proposal.items : [],
              content: proposal.content || { sections: [] }
            }}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>
    </LanguageProviderWrapper>
  );
}

