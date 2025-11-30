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
import { useState } from "react";
import { createClient } from "@/actions/clients";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function ClientDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    await createClient({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company_name: formData.get("company_name") as string,
      status: "active",
    });

    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg shadow-[#0A33C6]/20 border-0 font-primary font-bold">
          <Plus className="mr-2 h-4 w-4" /> {t("clients.addClient")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-[#EDEDED]">
        <DialogHeader>
          <DialogTitle className="font-primary text-[#02041D]">{t("clients.addClient")}</DialogTitle>
          <DialogDescription className="font-primary text-[#606170]">
            {t("clients.addNewClient")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-primary text-[#02041D]">
                {t("clients.name")}
              </Label>
              <Input 
                id="name" 
                name="name" 
                placeholder={t("clients.name")} 
                className="col-span-3 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right font-primary text-[#02041D]">
                {t("clients.email")}
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder={t("clients.email")} 
                className="col-span-3 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company_name" className="text-right font-primary text-[#02041D]">
                {t("clients.company")}
              </Label>
              <Input 
                id="company_name" 
                name="company_name" 
                placeholder={t("clients.company")} 
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
                {loading ? t("clients.saving") : t("clients.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
