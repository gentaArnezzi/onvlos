import { getFunnelDetails } from "@/actions/funnels";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { FunnelEditor } from "@/components/dashboard/funnels/funnel-editor";

export default async function FunnelBuilderPage({ params }: { params: { funnelId: string } }) {
  const funnel = await getFunnelDetails(params.funnelId);

  if (!funnel) {
    return <div>Funnel not found</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/funnels">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-lg font-semibold">{funnel.name}</h1>
                    <p className="text-xs text-muted-foreground">{funnel.public_url}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <Button variant="outline" size="sm" asChild>
                    <Link href={`/onboard/${funnel.public_url}`} target="_blank">
                        <Eye className="mr-2 h-4 w-4" /> Preview
                    </Link>
                 </Button>
                 <Button size="sm">Save Changes</Button>
            </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-muted/10 overflow-hidden">
            <FunnelEditor funnel={funnel} />
        </div>
    </div>
  );
}
