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

interface CreateInvoiceDialogProps {
  clients: { id: string; name: string; company_name: string | null }[];
  initialClientId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateInvoiceDialog({ clients, initialClientId, open: controlledOpen, onOpenChange: setControlledOpen }: CreateInvoiceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;
  
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedClient, setSelectedClient] = useState(initialClientId || "");
  const [currency, setCurrency] = useState("USD");
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
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Create Invoice</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Generate a new invoice for a client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-slate-900 dark:text-white">Client</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient} required>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                            <SelectValue placeholder="Select client" />
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
                    <Label className="text-slate-900 dark:text-white">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="IDR">IDR (Rp)</SelectItem>
                            <SelectItem value="SGD">SGD (S$)</SelectItem>
                            <SelectItem value="AUD">AUD (A$)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-900 dark:text-white">Due Date</Label>
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
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                    <Label className="text-slate-900 dark:text-white">Items</Label>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAddItem}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" /> Add Item
                    </Button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-slate-700 dark:text-slate-300">Description</Label>
                                <Input 
                                    value={item.name} 
                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                    placeholder="Service name"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    required 
                                />
                            </div>
                            <div className="w-20 space-y-1">
                                <Label className="text-xs text-slate-700 dark:text-slate-300">Qty</Label>
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
                                <Label className="text-xs text-slate-700 dark:text-slate-300">Price</Label>
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
                            <Label className="text-slate-900 dark:text-white">Discount</Label>
                            <div className="flex gap-2">
                                <Select value={discountType} onValueChange={(v: "amount" | "percentage") => setDiscountType(v)}>
                                    <SelectTrigger className="w-24 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="amount">$</SelectItem>
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
                            <Label className="text-slate-900 dark:text-white">Tax Rate (%)</Label>
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
                        <Label className="text-slate-900 dark:text-white">Notes / Terms (Optional)</Label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Payment terms, notes, etc."
                            rows={3}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none"
                        />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>Subtotal:</span>
                                <span>${calculateTotals().subtotal.toLocaleString()}</span>
                            </div>
                            {calculateTotals().discount > 0 && (
                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                    <span>Discount:</span>
                                    <span className="text-red-600 dark:text-red-400">-${calculateTotals().discount.toLocaleString()}</span>
                                </div>
                            )}
                            {calculateTotals().tax > 0 && (
                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                    <span>Tax:</span>
                                    <span>${calculateTotals().tax.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                Total: <span className="text-emerald-600 dark:text-emerald-400">${calculateTotals().total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-slate-900 dark:text-white">Status</Label>
                <Select value={status} onValueChange={(v: "draft" | "sent") => setStatus(v)}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">Save as Draft</SelectItem>
                        <SelectItem value="sent">Send to Client</SelectItem>
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
                Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={loading || !date || !selectedClient}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                ) : (
                    "Create Invoice"
                )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
