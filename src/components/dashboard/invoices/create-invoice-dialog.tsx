"use client";

import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import * as React from "react";
import { createInvoice } from "@/actions/invoices";
import { Plus, Trash2, Loader2, Repeat } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n/context";

interface CreateInvoiceDialogProps {
  clients: { id: string; name: string; company_name: string | null }[];
  initialClientId?: string;
  defaultCurrency?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateInvoiceDialog({ clients, initialClientId, defaultCurrency = "USD", open: controlledOpen, onOpenChange: setControlledOpen }: CreateInvoiceDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;
  
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedClient, setSelectedClient] = useState(initialClientId || "");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");
  const [discountValue, setDiscountValue] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"draft" | "sent">("draft");
  const [items, setItems] = useState([{ name: "", quantity: 1, unit_price: 0 }]);
  const [invoiceType, setInvoiceType] = useState<"single" | "retainer">("single");
  const [isRetainer, setIsRetainer] = useState(false);
  const [retainerFrequency, setRetainerFrequency] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [retainerInterval, setRetainerInterval] = useState(1);
  const [autopayEnabled, setAutopayEnabled] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();

  // Update selectedClient when initialClientId changes
  React.useEffect(() => {
    if (initialClientId) {
      setSelectedClient(initialClientId);
    }
  }, [initialClientId]);

  // Update currency when defaultCurrency changes
  React.useEffect(() => {
    if (defaultCurrency) {
      setCurrency(defaultCurrency);
    }
  }, [defaultCurrency]);

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotals = () => {
      const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
      const discount = discountType === "amount" 
          ? parseFloat(discountValue || "0")
          : (subtotal * parseFloat(discountValue || "0")) / 100;
      const afterDiscount = subtotal - discount;
      const tax = (afterDiscount * parseFloat(taxRate || "0")) / 100;
      const total = afterDiscount + tax;
      
      return {
          subtotal,
          discount,
          tax,
          total
      };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedClient) return;

    setLoading(true);
    
    const totals = calculateTotals();
    
    const result = await createInvoice({
      client_id: selectedClient || undefined,
      due_date: date,
      currency,
      items: items.map(i => ({ ...i, unit_price: Number(i.unit_price), quantity: Number(i.quantity) })),
      discount_amount: discountType === "amount" ? totals.discount : undefined,
      discount_percentage: discountType === "percentage" ? parseFloat(discountValue || "0") : undefined,
      tax_rate: parseFloat(taxRate || "0"),
      notes: notes || undefined,
      status,
      invoice_type: isRetainer ? "retainer" : "single",
      retainer_schedule: isRetainer ? {
        frequency: retainerFrequency,
        interval: retainerInterval,
      } : undefined,
      autopay_enabled: isRetainer ? autopayEnabled : false,
      is_public: isPublic,
    });

    setLoading(false);
    
    if (result.success) {
      setOpen(false);
      // Reset form
      setItems([{ name: "", quantity: 1, unit_price: 0 }]);
      setDate(undefined);
      setSelectedClient("");
      setCurrency("USD");
      setDiscountType("amount");
      setDiscountValue("");
      setTaxRate("");
      setNotes("");
      setStatus("draft");
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg shadow-[#0A33C6]/20 border-0 font-primary font-bold">
            <Plus className="mr-2 h-4 w-4" /> {t("invoices.createInvoice")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] bg-white border-[#EDEDED]">
        <DialogHeader>
          <DialogTitle className="font-primary text-[#02041D]">{t("invoices.createInvoice")}</DialogTitle>
          <DialogDescription className="font-primary text-[#606170]">
            {t("invoices.generateNewInvoice")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="font-primary text-[#02041D]">{t("invoices.client")}</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient} required>
                        <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                            <SelectValue placeholder={t("invoices.selectClient")} />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.company_name || c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-primary text-[#02041D]">{t("invoices.currency")}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                            <SelectItem value="IDR">IDR - Indonesian Rupiah (Rp)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-primary text-[#02041D]">{t("invoices.dueDate")}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal bg-white border-[#EDEDED] font-primary text-[#02041D]",
                                !date && "font-primary text-[#606170]"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>{t("invoices.pickDate")}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white border-[#EDEDED] shadow-lg">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="rounded-md"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                    <Label className="font-primary text-[#02041D]">{t("invoices.items")}</Label>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAddItem}
                        className="font-primary text-[#606170] hover:font-primary text-[#02041D]"
                    >
                        <Plus className="h-3 w-3 mr-1" /> {t("invoices.addItem")}
                    </Button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end p-3 rounded-lg bg-[#EDEDED] border border-[#EDEDED]">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs font-primary text-[#606170]">{t("invoices.description")}</Label>
                                <Input 
                                    value={item.name} 
                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                    placeholder={t("invoices.serviceName")}
                                    className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
                                    required 
                                />
                            </div>
                            <div className="w-20 space-y-1">
                                <Label className="text-xs font-primary text-[#606170]">{t("invoices.qty")}</Label>
                                <Input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                    min="1"
                                    className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
                                    required 
                                />
                            </div>
                            <div className="w-28 space-y-1">
                                <Label className="text-xs font-primary text-[#606170]">{t("invoices.price")}</Label>
                                <Input 
                                    type="number" 
                                    value={item.unit_price} 
                                    onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
                                    required 
                                />
                            </div>
                             <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 mb-0.5"
                                onClick={() => handleRemoveItem(index)}
                                disabled={items.length === 1}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-[#EDEDED]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-primary text-[#02041D]">{t("invoices.discount")}</Label>
                            <div className="flex gap-2">
                                <Select value={discountType} onValueChange={(v: "amount" | "percentage") => setDiscountType(v)}>
                                    <SelectTrigger className="w-24 bg-white border-[#EDEDED] font-primary text-[#02041D]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="amount">{getCurrencySymbol(currency)}</SelectItem>
                                        <SelectItem value="percentage">%</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={discountValue}
                                    onChange={e => setDiscountValue(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    className="flex-1 bg-white border-[#EDEDED] font-primary text-[#02041D]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-primary text-[#02041D]">{t("invoices.taxRate")}</Label>
                            <Input
                                type="number"
                                value={taxRate}
                                onChange={e => setTaxRate(e.target.value)}
                                placeholder="0"
                                min="0"
                                step="0.1"
                                className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="font-primary text-[#02041D]">{t("invoices.notesTerms")}</Label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder={t("invoices.paymentTerms")}
                            rows={3}
                            className="w-full px-3 py-2 rounded-md border border-[#EDEDED] bg-white font-primary text-[#02041D] placeholder:font-primary text-[#606170] resize-none"
                        />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-primary text-[#606170]">
                                <span>{t("invoices.subtotal")}</span>
                                <span>{getCurrencySymbol(currency)}{calculateTotals().subtotal.toLocaleString()}</span>
                            </div>
                            {calculateTotals().discount > 0 && (
                                <div className="flex justify-between text-sm font-primary text-[#606170]">
                                    <span>{t("invoices.discount")}:</span>
                                    <span className="text-red-600">-{getCurrencySymbol(currency)}{calculateTotals().discount.toLocaleString()}</span>
                                </div>
                            )}
                            {calculateTotals().tax > 0 && (
                                <div className="flex justify-between text-sm font-primary text-[#606170]">
                                    <span>{t("invoices.tax")}</span>
                                    <span>{getCurrencySymbol(currency)}{calculateTotals().tax.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold font-primary text-[#02041D]">
                                {t("invoices.total")} <span className="text-[#0A33C6]">{getCurrencySymbol(currency)}{calculateTotals().total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-[#EDEDED]">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="retainer"
                        checked={isRetainer}
                        onCheckedChange={(checked) => {
                            setIsRetainer(checked as boolean);
                            if (!checked) {
                                setAutopayEnabled(false);
                            }
                        }}
                    />
                    <Label htmlFor="retainer" className="font-primary text-[#02041D] cursor-pointer flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        {t("invoices.retainerInvoice", "Retainer Invoice")}
                    </Label>
                </div>
                
                {isRetainer && (
                    <div className="pl-6 space-y-3 border-l-2 border-[#EDEDED]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-primary text-[#02041D]">{t("invoices.frequency", "Frequency")}</Label>
                                <Select value={retainerFrequency} onValueChange={(v: "weekly" | "monthly" | "yearly") => setRetainerFrequency(v)}>
                                    <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">{t("invoices.weekly", "Weekly")}</SelectItem>
                                        <SelectItem value="monthly">{t("invoices.monthly", "Monthly")}</SelectItem>
                                        <SelectItem value="yearly">{t("invoices.yearly", "Yearly")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-primary text-[#02041D]">{t("invoices.interval", "Every")}</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={retainerInterval}
                                    onChange={(e) => setRetainerInterval(parseInt(e.target.value) || 1)}
                                    className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="autopay"
                                checked={autopayEnabled}
                                onCheckedChange={(checked) => setAutopayEnabled(checked as boolean)}
                            />
                            <Label htmlFor="autopay" className="font-primary text-[#02041D] cursor-pointer">
                                {t("invoices.enableAutopay", "Enable Autopay")}
                            </Label>
                        </div>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="public"
                        checked={isPublic}
                        onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                    />
                    <Label htmlFor="public" className="font-primary text-[#02041D] cursor-pointer">
                        {t("invoices.publicInvoice", "Public Invoice (Shareable Link)")}
                    </Label>
                </div>

                <div className="space-y-2">
                    <Label className="font-primary text-[#02041D]">{t("invoices.status")}</Label>
                    <Select value={status} onValueChange={(v: "draft" | "sent") => setStatus(v)}>
                        <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">{t("invoices.saveAsDraft")}</SelectItem>
                            <SelectItem value="sent">{t("invoices.sendToClient")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
                type="button"
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-[#EDEDED] font-primary text-[#02041D] bg-white hover:bg-[#EDEDED]"
            >
                {t("common.cancel")}
            </Button>
            <Button 
                type="submit" 
                disabled={loading || !date || !selectedClient}
                className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("invoices.creating")}
                    </>
                ) : (
                    t("invoices.createInvoice")
                )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
