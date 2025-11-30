"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createFlow } from "@/actions/flows";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface CreateFlowDialogProps {
  language?: Language;
}

export function CreateFlowDialog({ language: propLanguage }: CreateFlowDialogProps) {
  const { t: contextT, language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    layout: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createFlow({
        name: formData.name,
        description: formData.description || undefined,
        layout: formData.layout,
      });

      if (result.success) {
        setOpen(false);
        setFormData({ name: "", description: "", layout: "medium" });
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create flow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg font-primary">
          <Plus className="mr-2 h-4 w-4" />
          {language === "id" ? "Flow Baru" : "New Flow"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] font-primary">
        <DialogHeader>
          <DialogTitle className="text-[#02041D]">
            {language === "id" ? "Buat Flow Baru" : "Create New Flow"}
          </DialogTitle>
          <DialogDescription className="text-[#606170]">
            {language === "id" 
              ? "Buat flow untuk mengorganisir departemen, proyek, atau tim Anda."
              : "Create a flow to organize your department, project, or team."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#02041D]">
                {language === "id" ? "Nama Flow" : "Flow Name"}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === "id" ? "Contoh: Sales, Marketing, Customer Service" : "e.g., Sales, Marketing, Customer Service"}
                required
                className="font-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#02041D]">
                {language === "id" ? "Deskripsi" : "Description"}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === "id" ? "Deskripsi singkat tentang flow ini..." : "Brief description about this flow..."}
                rows={3}
                className="font-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout" className="text-[#02041D]">
                {language === "id" ? "Layout" : "Layout"}
              </Label>
              <Select
                value={formData.layout}
                onValueChange={(value) => setFormData({ ...formData, layout: value })}
              >
                <SelectTrigger className="font-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{language === "id" ? "Kecil" : "Small"}</SelectItem>
                  <SelectItem value="medium">{language === "id" ? "Sedang" : "Medium"}</SelectItem>
                  <SelectItem value="large">{language === "id" ? "Besar" : "Large"}</SelectItem>
                  <SelectItem value="app">{language === "id" ? "App" : "App"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="font-primary"
            >
              {language === "id" ? "Batal" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name}
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "id" ? "Membuat..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {language === "id" ? "Buat Flow" : "Create Flow"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

