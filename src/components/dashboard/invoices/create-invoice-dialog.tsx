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
import { Plus, Trash2, Loader2 } from "lucide-react";
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
      client_id: selectedClient,
      due_date: date,
      currency,
      items: items.map(i => ({ ...i, unit_price: Number(i.unit_price), quantity: Number(i.quantity) })),
      discount_amount: discountType === "amount" ? totals.discount : undefined,
      discount_percentage: discountType === "percentage" ? parseFloat(discountValue || "0") : undefined,
      tax_rate: parseFloat(taxRate || "0"),
      notes: notes || undefined,
      status,
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
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 border-0">
            <Plus className="mr-2 h-4 w-4" /> {t("invoices.createInvoice")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">{t("invoices.createInvoice")}</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {t("invoices.generateNewInvoice")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-slate-900 dark:text-white">{t("invoices.client")}</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient} required>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
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
                    <Label className="text-slate-900 dark:text-white">{t("invoices.currency")}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                            <SelectItem value="IDR">IDR - Indonesian Rupiah (Rp)</SelectItem>
                            <SelectItem value="SGD">SGD - Singapore Dollar (S$)</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar (A$)</SelectItem>
                            <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan (¥)</SelectItem>
                            <SelectItem value="MYR">MYR - Malaysian Ringgit (RM)</SelectItem>
                            <SelectItem value="THB">THB - Thai Baht (฿)</SelectItem>
                            <SelectItem value="PHP">PHP - Philippine Peso (₱)</SelectItem>
                            <SelectItem value="VND">VND - Vietnamese Dong (₫)</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                            <SelectItem value="KRW">KRW - South Korean Won (₩)</SelectItem>
                            <SelectItem value="HKD">HKD - Hong Kong Dollar (HK$)</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
                            <SelectItem value="NZD">NZD - New Zealand Dollar (NZ$)</SelectItem>
                            <SelectItem value="CHF">CHF - Swiss Franc (CHF)</SelectItem>
                            <SelectItem value="AED">AED - UAE Dirham (د.إ)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-900 dark:text-white">{t("invoices.dueDate")}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white",
                                !date && "text-slate-500 dark:text-slate-400"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>{t("invoices.pickDate")}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
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
                    <Label className="text-slate-900 dark:text-white">{t("invoices.items")}</Label>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAddItem}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" /> {t("invoices.addItem")}
                    </Button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-slate-700 dark:text-slate-300">{t("invoices.description")}</Label>
                                <Input 
                                    value={item.name} 
                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                    placeholder={t("invoices.serviceName")}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    required 
                                />
                            </div>
                            <div className="w-20 space-y-1">
                                <Label className="text-xs text-slate-700 dark:text-slate-300">{t("invoices.qty")}</Label>
                                <Input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                    min="1"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    required 
                                />
                            </div>
                            <div className="w-28 space-y-1">
                                <Label className="text-xs text-slate-700 dark:text-slate-300">{t("invoices.price")}</Label>
                                <Input 
                                    type="number" 
                                    value={item.unit_price} 
                                    onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    required 
                                />
                            </div>
                             <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 mb-0.5"
                                onClick={() => handleRemoveItem(index)}
                                disabled={items.length === 1}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-900 dark:text-white">{t("invoices.discount")}</Label>
                            <div className="flex gap-2">
                                <Select value={discountType} onValueChange={(v: "amount" | "percentage") => setDiscountType(v)}>
                                    <SelectTrigger className="w-24 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
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
                                    className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-900 dark:text-white">{t("invoices.taxRate")}</Label>
                            <Input
                                type="number"
                                value={taxRate}
                                onChange={e => setTaxRate(e.target.value)}
                                placeholder="0"
                                min="0"
                                step="0.1"
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-slate-900 dark:text-white">{t("invoices.notesTerms")}</Label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder={t("invoices.paymentTerms")}
                            rows={3}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none"
                        />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>{t("invoices.subtotal")}</span>
                                <span>{getCurrencySymbol(currency)}{calculateTotals().subtotal.toLocaleString()}</span>
                            </div>
                            {calculateTotals().discount > 0 && (
                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                    <span>{t("invoices.discount")}:</span>
                                    <span className="text-red-600 dark:text-red-400">-{getCurrencySymbol(currency)}{calculateTotals().discount.toLocaleString()}</span>
                                </div>
                            )}
                            {calculateTotals().tax > 0 && (
                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                    <span>{t("invoices.tax")}</span>
                                    <span>{getCurrencySymbol(currency)}{calculateTotals().tax.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                {t("invoices.total")} <span className="text-emerald-600 dark:text-emerald-400">{getCurrencySymbol(currency)}{calculateTotals().total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-slate-900 dark:text-white">{t("invoices.status")}</Label>
                <Select value={status} onValueChange={(v: "draft" | "sent") => setStatus(v)}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">{t("invoices.saveAsDraft")}</SelectItem>
                        <SelectItem value="sent">{t("invoices.sendToClient")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
                type="button"
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
                {t("common.cancel")}
            </Button>
            <Button 
                type="submit" 
                disabled={loading || !date || !selectedClient}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"
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
