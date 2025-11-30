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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createFunnel } from "@/actions/funnels";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

export function CreateFunnelDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await createFunnel(
      formData.get("name") as string,
      formData.get("description") as string,
    );

    if (res.success && res.funnel) {
      router.push(`/dashboard/funnels/${res.funnel.id}`);
    }

    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0731c2] hover:bg-[#0525a0] text-white">
          <Plus className="mr-2 h-4 w-4" /> {t("funnels.newFunnel")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{t("funnels.createFunnel")}</DialogTitle>
          <DialogDescription className="text-slate-600">
            {t("funnels.startNewFlow")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-slate-900">
                {t("funnels.name")}
              </Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Website Design Onboarding" 
                className="col-span-3 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-slate-900">
                {t("common.description")}
              </Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Standard flow for new clients" 
                className="col-span-3 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#0731c2] hover:bg-[#0525a0] text-white"
            >
              {loading ? t("funnels.creating") : t("funnels.createFunnel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
