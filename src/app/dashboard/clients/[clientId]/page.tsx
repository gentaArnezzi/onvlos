import { getConversation, getClientSpaceId } from "@/actions/chat";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageSquare, FileText, CheckSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { client_companies, workspaces } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { FileManager } from "@/components/dashboard/files/file-manager";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { getCurrencySymbol } from "@/lib/currency";

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
    // Await params in Next.js 15+
    const { clientId } = await params;
    
    // Get session and workspace
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.created_by_user_id, session.user.id)
    });

    if (!workspace) {
        return notFound();
    }
    
    // Fetch Client Info with workspace filter
    const client = await db.query.client_companies.findFirst({
        where: and(
            eq(client_companies.id, clientId),
            eq(client_companies.workspace_id, workspace.id)
        )
    });

    if (!client) return notFound();

    const defaultCurrencySymbol = getCurrencySymbol(workspace?.default_currency || "USD");
    const currentUserId = session.user.id;

    const spaceId = await getClientSpaceId(client.id);
    let chatData = null;

    if (spaceId) {
        chatData = await getConversation(spaceId);
    }

    return (
        <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" asChild className="font-primary text-[#606170] hover:font-primary text-[#02041D]">
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-primary text-[#02041D]">
                        {client.company_name || "No Company Name"}
                    </h2>
                    <p className="font-primary text-[#606170] mt-1">
                        {client.name} {client.email && `• ${client.email}`}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-white border-[#EDEDED] w-full sm:w-auto overflow-x-auto scrollbar-hide">
                    <TabsTrigger value="overview" className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0">
                        Chat
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0">
                        Tasks
                    </TabsTrigger>
                    <TabsTrigger value="files" className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0">
                        Files
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-none shadow-lg bg-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-primary text-[#606170]">Status</CardTitle>
                                <CheckSquare className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D] capitalize">
                                    {client.status || "lead"}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-lg bg-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-primary text-[#606170]">Contract Value</CardTitle>
                                <FileText className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">
                                    {defaultCurrencySymbol}{client.contract_value ? Number(client.contract_value).toLocaleString() : "0"}
                                </div>
                            </CardContent>
                        </Card>
                        {client.category && (
                            <Card className="border-none shadow-lg bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium font-primary text-[#606170]">Category</CardTitle>
                                    <FileText className="h-4 w-4 text-slate-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">
                                        {client.category}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    {client.description && (
                        <Card className="border-none shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="font-primary text-[#02041D]">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-primary text-[#606170]">{client.description}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="chat" className="h-full">
                    {chatData ? (
                        <Card className="border-none shadow-lg bg-white">
                            <CardContent className="p-0">
                                <ChatInterface 
                                    conversationId={chatData.conversation.id}
                                    initialMessages={chatData.messages}
                                    currentUserId={currentUserId}
                                    className="h-[600px]"
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-lg bg-white">
                            <CardContent className="py-10 text-center font-primary text-[#606170]">
                                No client space found. Please onboard the client first to enable chat.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                
                <TabsContent value="tasks">
                    <Card className="border-none shadow-lg bg-white">
                        <CardContent className="py-10 text-center font-primary text-[#606170]">
                            Task management for specific client view coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="files">
                    <Card className="border-none shadow-lg bg-white">
                        <CardContent>
                            <FileManager clientId={client.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
