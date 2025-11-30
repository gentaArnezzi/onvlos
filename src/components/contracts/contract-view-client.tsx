"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, FileText, FileSignature, Send, Eye, Building2, User } from "lucide-react";
import { useState, useRef } from "react";
import { sendContract, signContract } from "@/actions/proposals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignatureCanvas from 'react-signature-canvas';

interface ContractViewClientProps {
  contract: any;
}

export function ContractViewClient({ contract }: ContractViewClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const sigCanvas = useRef<SignatureCanvas>(null);

  const isFullySigned = contract.fully_signed;
  const isSigned = contract.status === "signed";
  const isCancelled = contract.status === "cancelled";
  const isCompleted = contract.status === "completed";
  const canSend = contract.status === "draft";
  const canSign = (contract.status === "sent" || contract.status === "viewed") && !isFullySigned;

  const handleSend = async () => {
    if (!canSend) return;
    
    setLoading(true);
    try {
      const result = await sendContract(contract.id);
      if (result.success) {
        toast.success(t("contracts.sendSuccess"));
        router.refresh();
      } else {
        toast.error(result.error || t("contracts.sendFailed"));
      }
    } catch (error) {
      toast.error(t("contracts.sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const openSignatureDialog = (partyId: string) => {
    const party = contract.parties.find((p: any) => p.id === partyId);
    if (party) {
      setSelectedPartyId(partyId);
      setSignerName(party.name || "");
      setSignerEmail(party.email || "");
      setShowSignatureDialog(true);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (!selectedPartyId || !canSign) return;

    if (!signerName || !signerEmail) {
      toast.error(t("contracts.nameEmailRequired"));
      return;
    }

    if (sigCanvas.current?.isEmpty()) {
      toast.error(t("contracts.pleaseSignToSign"));
      return;
    }

    const signatureData = sigCanvas.current?.toDataURL() || "";
    
    setLoading(true);
    try {
      const result = await signContract(contract.id, selectedPartyId, signatureData, signerName, signerEmail);
      if (result.success) {
        toast.success(result.fullySigned ? t("contracts.fullySignedSuccess") : t("contracts.signSuccess"));
        setShowSignatureDialog(false);
        setSelectedPartyId(null);
        sigCanvas.current?.clear();
        router.refresh();
      } else {
        toast.error(result.error || t("contracts.signFailed"));
      }
    } catch (error) {
      toast.error(t("contracts.signFailed"));
    } finally {
      setLoading(false);
    }
  };

  const sections = contract.content?.sections || [];
  const parties = contract.parties || [];

  return (
    <div className="space-y-6">
      {/* Contract Content Sections */}
      {sections.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              {t("contracts.content")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((section: any) => (
                <div key={section.id} className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-0 last:pb-0">
                  {section.type === "header" && (
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      {section.content}
                    </h2>
                  )}
                  {section.type === "clause" && (
                    <div>
                      {section.title && (
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.type === "terms" && (
                    <div>
                      {section.title && (
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.type === "signature" && (
                    <div>
                      {section.title && (
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Parties Information */}
      {parties.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              {t("contracts.parties")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parties.map((party: any) => (
              <div key={party.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {party.type === "company" ? (
                    <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {party.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {party.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {party.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {party.signed ? (
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t("contracts.signed")}
                      </Badge>
                      {party.signature_data && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            {t("contracts.signature")}:
                          </p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={party.signature_data}
                            alt="Signature"
                            className="border border-slate-200 dark:border-slate-700 rounded-md max-w-[150px] h-auto"
                          />
                          {party.signed_at && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {format(new Date(party.signed_at), "MMM d, yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {t("contracts.pending")}
                    </Badge>
                  )}
                  {canSign && !party.signed && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => openSignatureDialog(party.id)}
                        disabled={loading}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      >
                        <FileSignature className="h-4 w-4 mr-2" />
                        {t("contracts.sign")}
                      </Button>
                      {showSignatureDialog && selectedPartyId === party.id && (
                        <Dialog open={true} onOpenChange={(open) => {
                          if (!open) {
                            setShowSignatureDialog(false);
                            setSelectedPartyId(null);
                            sigCanvas.current?.clear();
                          }
                        }}>
                          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <DialogHeader>
                              <DialogTitle>{t("contracts.signContract")}</DialogTitle>
                              <DialogDescription>
                                {t("contracts.signContractDescription")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="signerName" className="text-right">
                                  {t("contracts.enterYourName")}
                                </Label>
                                <Input
                                  id="signerName"
                                  value={signerName}
                                  onChange={(e) => setSignerName(e.target.value)}
                                  className="col-span-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="signerEmail" className="text-right">
                                  {t("contracts.enterYourEmail")}
                                </Label>
                                <Input
                                  id="signerEmail"
                                  type="email"
                                  value={signerEmail}
                                  onChange={(e) => setSignerEmail(e.target.value)}
                                  className="col-span-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">
                                  {t("contracts.signHere")}
                                </Label>
                                <div className="col-span-3 border border-slate-300 dark:border-slate-700 rounded-md">
                                  <SignatureCanvas
                                    ref={sigCanvas}
                                    penColor='black'
                                    canvasProps={{ width: 400, height: 150, className: 'sigCanvas bg-white dark:bg-slate-800 rounded-md' }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end col-span-4">
                                <Button variant="outline" onClick={clearSignature} className="text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                                  {t("contracts.clearSignature")}
                                </Button>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setShowSignatureDialog(false);
                                setSelectedPartyId(null);
                                sigCanvas.current?.clear();
                              }} className="text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                                {t("contracts.cancel")}
                              </Button>
                              <Button onClick={handleSign} disabled={loading || !signerName || !signerEmail || sigCanvas.current?.isEmpty()}>
                                {t("contracts.confirmSignature")}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contract Details */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">
            {t("contracts.details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {contract.effective_date && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("contracts.effectiveDate")}
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {format(new Date(contract.effective_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.expiry_date && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("contracts.expiryDate")}
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {format(new Date(contract.expiry_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.fully_signed_at && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("contracts.fullySignedAt")}
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {format(new Date(contract.fully_signed_at), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.view_count !== undefined && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t("contracts.viewCount")}
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {contract.view_count}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {canSend && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <Button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {t("contracts.sendContract")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Proposal Link */}
      {contract.proposal && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              asChild
              className="w-full"
            >
              <Link href={`/proposal/${contract.proposal.public_url || contract.proposal.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                {t("contracts.viewProposal")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {isFullySigned && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-300">
                  {t("contracts.fullySignedMessage")}
                </p>
                {contract.fully_signed_at && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                    {t("contracts.fullySignedOn", { date: format(new Date(contract.fully_signed_at), "MMM d, yyyy") })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="font-medium text-red-900 dark:text-red-300">
                {t("contracts.cancelledMessage")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

