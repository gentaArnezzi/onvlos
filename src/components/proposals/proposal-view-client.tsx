"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, FileText, User, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { acceptProposal, declineProposal } from "@/actions/proposals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

interface ProposalViewClientProps {
  proposal: any;
  currencySymbol: string;
}

export function ProposalViewClient({ proposal, currencySymbol }: ProposalViewClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date();
  const isAccepted = proposal.status === "accepted";
  const isDeclined = proposal.status === "declined";
  // Only allow accept/decline if proposal is sent (not draft) and not already accepted/declined/expired
  const canAccept = proposal.status === "sent" && !isAccepted && !isDeclined && !isExpired;

  const handleAccept = async () => {
    if (!canAccept) return;
    
    // Confirm acceptance
    if (!confirm(t("proposals.acceptConfirm"))) {
      return;
    }
    
    setLoading(true);
    try {
      // Use client info from proposal
      const signerName = proposal.client?.name || proposal.client?.company_name || "Client";
      const signerEmail = proposal.client?.email || "";
      
      const result = await acceptProposal(proposal.id, "", signerName, signerEmail);
      if (result.success) {
        toast.success(t("proposals.acceptedSuccess"));
        router.refresh();
      } else {
        toast.error(result.error || t("proposals.acceptFailed"));
      }
    } catch (error) {
      toast.error(t("proposals.acceptFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    setLoading(true);
    try {
      const result = await declineProposal(proposal.id, declineReason);
      if (result.success) {
        toast.success("Proposal declined");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to decline proposal");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Info */}
      {proposal.client && (
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {proposal.client.name || proposal.client.company_name || "Client"}
                </p>
                {proposal.client.email && (
                  <p className="text-sm text-slate-600">
                    {proposal.client.email}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposal Details */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">{t("proposals.details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Sections */}
          {proposal.content?.sections && proposal.content.sections.length > 0 && (
            <div className="space-y-6">
              {proposal.content.sections
                .sort((a: any, b: any) => a.order - b.order)
                .map((section: any, index: number) => (
                  <div key={section.id || index} className="prose max-w-none">
                    {section.type === "header" && (
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                      </h2>
                    )}
                    {section.type === "text" && (
                      <p className="text-slate-700 leading-relaxed">
                        {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                      </p>
                    )}
                    {section.type === "pricing" && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {section.title || t("proposals.pricing")}
                        </h3>
                        {typeof section.content === 'string' ? (
                          <p className="text-slate-700">
                            {section.content}
                          </p>
                        ) : Array.isArray(section.content) ? (
                          <div className="space-y-2">
                            {section.content.map((item: any, idx: number) => {
                              if (typeof item === 'string') {
                                return <div key={idx} className="text-slate-700">{item}</div>;
                              }
                              if (item && typeof item === 'object') {
                                return (
                                  <div key={idx} className="text-slate-700">
                                    {item.name && (
                                      <div className="font-medium">{item.name}</div>
                                    )}
                                    {item.description && (
                                      <div className="text-sm text-slate-600">{item.description}</div>
                                    )}
                                    {item.quantity && item.unit_price && (
                                      <div className="text-sm">
                                        {t("proposals.quantity")}: {item.quantity} × {currencySymbol}{Number(item.unit_price).toLocaleString()}
                                        {item.total && ` = ${currencySymbol}${Number(item.total).toLocaleString()}`}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        ) : section.content && typeof section.content === 'object' ? (
                          <p className="text-slate-700">
                            {section.content.name || section.content.title || section.content.description || ''}
                          </p>
                        ) : (
                          <p className="text-slate-700">
                            {String(section.content || '')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Items */}
          {proposal.items && Array.isArray(proposal.items) && proposal.items.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-4">{t("proposals.items")}</h3>
              <div className="space-y-3">
                {proposal.items.map((item: any, index: number) => {
                  // Ensure item is an object and has required fields
                  if (!item || typeof item !== 'object') return null;
                  
                  return (
                    <div key={item.id || index} className="flex justify-between items-start p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {item.name || t("proposals.unnamedItem")}
                        </p>
                        {item.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {typeof item.description === 'string' ? item.description : String(item.description)}
                          </p>
                        )}
                        <p className="text-sm text-slate-600 mt-1">
                          {t("proposals.quantity")}: {item.quantity || 0} × {currencySymbol}{Number(item.unit_price || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {currencySymbol}{Number(item.total || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="space-y-2">
              {proposal.subtotal && (
                <div className="flex justify-between text-slate-700">
                  <span>{t("proposals.subtotal")}</span>
                  <span>{currencySymbol}{Number(proposal.subtotal).toLocaleString()}</span>
                </div>
              )}
              {proposal.discount_amount && Number(proposal.discount_amount) > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>{t("invoices.discount")}</span>
                  <span className="text-emerald-600">
                    -{currencySymbol}{Number(proposal.discount_amount).toLocaleString()}
                  </span>
                </div>
              )}
              {proposal.tax_amount && Number(proposal.tax_amount) > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>{t("invoices.tax")}</span>
                  <span>{currencySymbol}{Number(proposal.tax_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>{t("proposals.total")}</span>
                <span>{currencySymbol}{Number(proposal.total || proposal.subtotal || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validity & Dates */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposal.valid_until && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t("proposals.validUntil")}</p>
                  <p className="font-medium text-slate-900">
                    {format(new Date(proposal.valid_until), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}
            {proposal.total && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t("proposals.totalAmount")}</p>
                  <p className="font-medium text-slate-900">
                    {currencySymbol}{Number(proposal.total).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Message for Draft Proposals */}
      {proposal.status === "draft" && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-300">
                  {t("proposals.draftNotice")}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  {t("proposals.draftNoticeDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions - Only show if proposal is sent */}
      {canAccept && (
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {t("proposals.acceptanceNotice")}
              </p>
            </div>
            {!showDeclineReason ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t("proposals.accept")}
                </Button>
                <Button
                  onClick={() => setShowDeclineReason(true)}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("proposals.decline")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder={t("proposals.declineReason")}
                  className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 bg-white text-slate-900 placeholder:text-slate-500"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleDecline}
                    disabled={loading || !declineReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {t("proposals.confirmDecline")}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeclineReason(false);
                      setDeclineReason("");
                    }}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {isAccepted && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">
                  {t("proposals.accepted")}
                </p>
                {proposal.accepted_at && (
                  <p className="text-sm text-emerald-700">
                    {t("proposals.acceptedOn")} {format(new Date(proposal.accepted_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isDeclined && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">
                  {t("proposals.declined")}
                </p>
                {proposal.declined_at && (
                  <p className="text-sm text-red-700">
                    {t("proposals.declinedOn")} {format(new Date(proposal.declined_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
                {proposal.decline_reason && (
                  <p className="text-sm text-red-700 mt-1">
                    {t("proposals.reason")}: {proposal.decline_reason}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isExpired && !isAccepted && !isDeclined && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  {t("proposals.expired")}
                </p>
                <p className="text-sm text-orange-700">
                  {t("proposals.expiredMessage")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

