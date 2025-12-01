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
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/actions/clients";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ClientDialog() {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await createClient({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company_name: formData.get("company_name") as string,
      status: "active",
    });

    if (result.success) {
      toast.success(t("clients.clientCreated") || "Client created successfully");
      // Reset form before closing dialog
      if (formRef.current) {
        formRef.current.reset();
      }
      setOpen(false);
      // Refresh the page to show new client
      router.refresh();
    } else {
      toast.error(result.error || t("clients.createError") || "Failed to create client");
    }

    setLoading(false);
  };

  // Show placeholder during SSR to prevent hydration mismatch
  const buttonText = mounted ? t("clients.addClient") : "Add Client";
  const dialogTitle = mounted ? t("clients.addClient") : "Add Client";
  const dialogDescription = mounted ? t("clients.addNewClient") : "Add a new client to your workspace";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg shadow-[#0A33C6]/20 border-0 font-primary font-bold"
        >
          <Plus className="mr-2 h-4 w-4" /> {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-[#EDEDED]">
        <DialogHeader>
          <DialogTitle className="font-primary text-[#02041D]">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="font-primary text-[#606170]">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-primary text-[#02041D]">
                {mounted ? t("clients.name") : "Name"}
              </Label>
              <Input 
                id="name" 
                name="name" 
                placeholder={mounted ? t("clients.name") : "Name"} 
                className="col-span-3 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right font-primary text-[#02041D]">
                {mounted ? t("clients.email") : "Email"}
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder={mounted ? t("clients.email") : "Email"} 
                className="col-span-3 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company_name" className="text-right font-primary text-[#02041D]">
                {mounted ? t("clients.company") : "Company"}
              </Label>
              <Input 
                id="company_name" 
                name="company_name" 
                placeholder={mounted ? t("clients.company") : "Company"} 
                className="col-span-3 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
                required 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white"
            >
                {loading 
                  ? (mounted ? t("clients.saving") : "Saving...") 
                  : (mounted ? t("clients.saveChanges") : "Save Changes")
                }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
