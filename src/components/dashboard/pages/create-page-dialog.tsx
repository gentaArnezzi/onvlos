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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createPage } from "@/actions/pages";
import { useRouter } from "next/navigation";
import { Language } from "@/lib/i18n/translations";

interface CreatePageDialogProps {
  language: Language;
}

export function CreatePageDialog({ language }: CreatePageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    page_type: "landing_page",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createPage({
        name: formData.name,
        page_type: formData.page_type,
        content: {},
      });

      if (result.success && result.page) {
        setOpen(false);
        setFormData({ name: "", page_type: "landing_page" });
        router.push(`/dashboard/pages/${result.page.id}`);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg font-primary">
          <Plus className="mr-2 h-4 w-4" />
          {language === "id" ? "Halaman Baru" : "New Page"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] font-primary">
        <DialogHeader>
          <DialogTitle className="text-[#02041D]">
            {language === "id" ? "Buat Halaman Baru" : "Create New Page"}
          </DialogTitle>
          <DialogDescription className="text-[#606170]">
            {language === "id" 
              ? "Buat halaman website, landing page, atau link-in-bio."
              : "Create a website, landing page, or link-in-bio page."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#02041D]">
                {language === "id" ? "Nama Halaman" : "Page Name"}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === "id" ? "Contoh: Homepage, About Us" : "e.g., Homepage, About Us"}
                required
                className="font-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page_type" className="text-[#02041D]">
                {language === "id" ? "Tipe Halaman" : "Page Type"}
              </Label>
              <Select
                value={formData.page_type}
                onValueChange={(value) => setFormData({ ...formData, page_type: value })}
              >
                <SelectTrigger className="font-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">{language === "id" ? "Website" : "Website"}</SelectItem>
                  <SelectItem value="landing_page">{language === "id" ? "Landing Page" : "Landing Page"}</SelectItem>
                  <SelectItem value="link_in_bio">{language === "id" ? "Link in Bio" : "Link in Bio"}</SelectItem>
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
                  {language === "id" ? "Buat Halaman" : "Create Page"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

