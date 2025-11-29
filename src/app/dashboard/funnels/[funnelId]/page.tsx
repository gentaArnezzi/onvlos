import { getFunnelDetails } from "@/actions/funnels";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { FunnelEditor } from "@/components/dashboard/funnels/funnel-editor";

export default async function FunnelBuilderPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;
    const funnel = await getFunnelDetails(funnelId);

    if (!funnel) {
        return <div>Funnel not found</div>;
    }

    return (
        <div className="fixed inset-0 top-0 z-50 flex flex-col bg-background">
            {/* Editor Component handles its own header and layout now for full control */}
            <FunnelEditor funnel={funnel} />
        </div>
    );
}
