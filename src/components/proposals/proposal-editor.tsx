"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Send, Loader2 } from "lucide-react";
import { createProposal, sendProposal } from "@/actions/proposals";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

interface ProposalItem {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface ProposalEditorProps {
  clients: Array<{
    id: string;
    name: string;
    company_name?: string | null;
  }>;
  currencySymbol?: string;
}

export function ProposalEditor({ clients, currencySymbol = "$" }: ProposalEditorProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [proposalId, setProposalId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    introduction: "",
    scope: "",
    timeline: "",
    terms: "",
    valid_days: 30
  });
  
  const [items, setItems] = useState<ProposalItem[]>([
    { name: "", description: "", quantity: 1, unit_price: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { name: "", description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ProposalItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unit_price' ? Number(value) : value
    };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSave = async (sendAfterSave = false) => {
    setLoading(true);
    
    const content = {
      sections: [
        {
          id: "1",
          type: "header",
          content: formData.title,
          order: 0
        },
        {
          id: "2",
          type: "text",
          content: formData.introduction,
          order: 1
        },
        {
          id: "3",
          type: "text",
          content: formData.scope,
          order: 2
        },
        {
          id: "4",
          type: "pricing",
          content: items,
          order: 3
        },
        {
          id: "5",
          type: "text",
          content: formData.timeline,
          order: 4
        },
        {
          id: "6",
          type: "terms",
          content: formData.terms,
          order: 5
        }
      ],
      styles: {
        primaryColor: "#000000",
        fontFamily: "Inter"
      }
    };
    
    const result = await createProposal({
      client_id: formData.client_id,
      title: formData.title,
      content,
      items: items.filter(item => item.name),
      valid_days: formData.valid_days
    });
    
    if (result.success && result.proposal) {
      setProposalId(result.proposal.id);
      
      if (sendAfterSave) {
        setSendingProposal(true);
        const sendResult = await sendProposal(result.proposal.id);
        if (sendResult.success) {
          router.push("/dashboard/proposals");
        }
        setSendingProposal(false);
      } else {
        router.push("/dashboard/proposals");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6 bg-transparent">
      {/* Client Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">{t("proposals.clientInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client" className="text-slate-900">{t("proposals.selectClientRequired")}</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                <SelectValue placeholder={t("proposals.chooseClient")} />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="text-slate-900 focus:bg-slate-100">
                    {client.company_name || client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-slate-900">{t("proposals.proposalTitleRequired")}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t("proposals.proposalTitlePlaceholder")}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="valid_days" className="text-slate-900">{t("proposals.validFor")}</Label>
            <Input
              id="valid_days"
              type="number"
              value={formData.valid_days}
              onChange={(e) => setFormData({ ...formData, valid_days: parseInt(e.target.value) || 30 })}
              className="bg-white border-slate-200 text-slate-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Proposal Content */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">{t("proposals.proposalContent")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="introduction" className="text-slate-900">{t("proposals.introduction")}</Label>
            <Textarea
              id="introduction"
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              placeholder={t("proposals.introductionPlaceholder")}
              rows={4}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="scope" className="text-slate-900">{t("proposals.scopeOfWork")}</Label>
            <Textarea
              id="scope"
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              placeholder={t("proposals.scopeOfWorkPlaceholder")}
              rows={6}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="timeline" className="text-slate-900">{t("proposals.timeline")}</Label>
            <Textarea
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              placeholder={t("proposals.timelinePlaceholder")}
              rows={4}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">{t("proposals.pricing")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label className="text-slate-900">{t("proposals.itemName")}</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder={t("proposals.serviceProduct")}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-slate-900">{t("proposals.description")}</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder={t("proposals.descriptionPlaceholder")}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-slate-900">{t("proposals.quantity")}</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    min="1"
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-slate-900">{t("proposals.unitPrice")}</Label>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    min="0"
                    step="0.01"
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-slate-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full border-slate-200 text-slate-900 hover:bg-slate-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("proposals.addItem")}
            </Button>
            
            <div className="text-right pt-4 border-t border-slate-200">
              <div className="text-2xl font-bold text-slate-900">
                {t("proposals.total")}: {currencySymbol}{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">{t("proposals.termsConditions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
            placeholder={t("proposals.termsPlaceholder")}
            rows={6}
            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/proposals")}
          className="border-slate-200 text-slate-900 hover:bg-slate-100"
        >
          {t("proposals.cancel")}
        </Button>
        <Button
          onClick={() => handleSave(false)}
          disabled={loading || !formData.client_id || !formData.title}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("proposals.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("proposals.saveDraft")}
            </>
          )}
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={loading || sendingProposal || !formData.client_id || !formData.title}
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white"
        >
          {sendingProposal ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("proposals.sending")}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {t("proposals.saveSend")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
