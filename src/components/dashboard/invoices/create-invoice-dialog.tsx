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
import { useState } from "react";
import { createInvoice } from "@/actions/invoices";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateInvoiceDialogProps {
  clients: { id: string; name: string; company_name: string | null }[];
}

export function CreateInvoiceDialog({ clients }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState([{ name: "", quantity: 1, unit_price: 0 }]);

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

  const calculateTotal = () => {
      return items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedClient) return;

    setLoading(true);
    
    await createInvoice({
      client_id: selectedClient,
      due_date: date,
      items: items.map(i => ({ ...i, unit_price: Number(i.unit_price), quantity: Number(i.quantity) })),
    });

    setLoading(false);
    setOpen(false);
    // Reset form
    setItems([{ name: "", quantity: 1, unit_price: 0 }]);
    setDate(undefined);
    setSelectedClient("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Generate a new invoice for a client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Client</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient} required>
                        <SelectTrigger>
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
                    <Label>Due Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                    <Label>Items</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddItem}>
                        <Plus className="h-3 w-3 mr-1" /> Add Item
                    </Button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Input 
                                    value={item.name} 
                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                    placeholder="Service name"
                                    required 
                                />
                            </div>
                            <div className="w-20 space-y-1">
                                <Label className="text-xs">Qty</Label>
                                <Input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                    min="1"
                                    required 
                                />
                            </div>
                            <div className="w-28 space-y-1">
                                <Label className="text-xs">Price</Label>
                                <Input 
                                    type="number" 
                                    value={item.unit_price} 
                                    onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    required 
                                />
                            </div>
                             <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive mb-0.5"
                                onClick={() => handleRemoveItem(index)}
                                disabled={items.length === 1}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-end text-lg font-bold">
                    Total: ${calculateTotal().toLocaleString()}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
