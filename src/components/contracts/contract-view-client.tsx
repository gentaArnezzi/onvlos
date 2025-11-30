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
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("contracts.content")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((section: any) => (
                <div key={section.id} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0">
                  {section.type === "header" && (
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      {section.content}
                    </h2>
                  )}
                  {section.type === "clause" && (
                    <div>
                      {section.title && (
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="text-slate-700 whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.type === "terms" && (
                    <div>
                      {section.title && (
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="text-slate-700 whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.type === "signature" && (
                    <div>
                      {section.title && (
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {section.title}
                        </h3>
                      )}
                      <p className="text-slate-700 whitespace-pre-line">
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
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("contracts.parties")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parties.map((party: any) => (
              <div key={party.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${party.type === "company" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                    {party.type === "company" ? (
                      <Building2 className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {party.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {party.email}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {party.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {party.signed ? (
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t("contracts.signed")}
                      </Badge>
                      {party.signature_data && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-500 mb-1">
                            {t("contracts.signature")}:
                          </p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={party.signature_data}
                            alt="Signature"
                            className="border border-slate-200 rounded-md max-w-[150px] h-auto"
                          />
                          {party.signed_at && (
                            <p className="text-xs text-slate-500 mt-1">
                              {format(new Date(party.signed_at), "MMM d, yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700 border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {t("contracts.pending")}
                    </Badge>
                  )}
                  {canSign && !party.signed && (
                    <Button
                      size="sm"
                      onClick={() => openSignatureDialog(party.id)}
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      {t("contracts.sign")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contract Details */}
      <Card className="border-none shadow-lg bg-white relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-700">
            {t("contracts.details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {contract.effective_date && (
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {t("contracts.effectiveDate")}
                </p>
                <p className="font-medium text-slate-900">
                  {format(new Date(contract.effective_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.expiry_date && (
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {t("contracts.expiryDate")}
                </p>
                <p className="font-medium text-slate-900">
                  {format(new Date(contract.expiry_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.fully_signed_at && (
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {t("contracts.fullySignedAt")}
                </p>
                <p className="font-medium text-slate-900">
                  {format(new Date(contract.fully_signed_at), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.view_count !== undefined && (
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {t("contracts.viewCount")}
                </p>
                <p className="font-medium text-slate-900">
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

      {/* Signature Dialog - Single instance outside loop */}
      <Dialog open={showSignatureDialog} onOpenChange={(open) => {
        if (!open) {
          setShowSignatureDialog(false);
          setSelectedPartyId(null);
          sigCanvas.current?.clear();
          setSignerName("");
          setSignerEmail("");
        }
      }}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {t("contracts.signContract")}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {t("contracts.signContractDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="signerName" className="text-sm font-medium text-slate-700">
                {t("contracts.enterYourName")}
              </Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="signerEmail" className="text-sm font-medium text-slate-700">
                {t("contracts.enterYourEmail")}
              </Label>
              <Input
                id="signerEmail"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                className="w-full bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                placeholder="Masukkan email"
                required
              />
            </div>

            {/* Signature Canvas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                {t("contracts.signHere")}
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 bg-slate-50">
                <div className="bg-white rounded-md overflow-hidden border border-slate-200">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor='#1e293b'
                    backgroundColor="transparent"
                    canvasProps={{ 
                      width: 550, 
                      height: 200, 
                      className: 'w-full h-auto rounded-md cursor-crosshair' 
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={clearSignature} 
                  className="text-slate-600 border-slate-300 hover:bg-slate-100"
                >
                  {t("contracts.clearSignature")}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSignatureDialog(false);
                setSelectedPartyId(null);
                sigCanvas.current?.clear();
                setSignerName("");
                setSignerEmail("");
              }} 
              className="text-slate-700 border-slate-300 hover:bg-slate-100"
            >
              {t("contracts.cancel")}
            </Button>
            <Button 
              onClick={handleSign} 
              disabled={loading || !signerName || !signerEmail || sigCanvas.current?.isEmpty()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {t("contracts.processing") || "Memproses..."}
                </>
              ) : (
                <>
                  <FileSignature className="h-4 w-4 mr-2" />
                  {t("contracts.confirmSignature")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proposal Link */}
      {contract.proposal && (
        <Card className="border-none shadow-lg bg-white">
          <CardContent className="pt-6">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-[#0731c2] to-[#010119] hover:from-[#0525a0] hover:to-[#000000] text-white shadow-lg shadow-[#0731c2]/20"
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
        <Card className="border-none shadow-lg bg-emerald-50 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">
                  {t("contracts.fullySignedMessage")}
                </p>
                {contract.fully_signed_at && (
                  <p className="text-sm font-medium text-emerald-800 mt-1">
                    {t("contracts.fullySignedOn", { date: format(new Date(contract.fully_signed_at), "MMM d, yyyy") })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-none shadow-lg bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="font-semibold text-red-900">
                {t("contracts.cancelledMessage")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

