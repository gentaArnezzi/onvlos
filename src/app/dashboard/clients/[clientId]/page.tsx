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

// Mock user ID for dashboard (Admin)
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000"; 

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

    const spaceId = await getClientSpaceId(client.id);
    let chatData = null;

    if (spaceId) {
        chatData = await getConversation(spaceId);
    }

    return (
        <div className="flex-1 space-y-6 p-8 max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" asChild className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {client.company_name || "No Company Name"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {client.name} {client.email && `• ${client.email}`}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <TabsTrigger value="overview" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">
                        Chat
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">
                        Tasks
                    </TabsTrigger>
                    <TabsTrigger value="files" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">
                        Files
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</CardTitle>
                                <CheckSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                                    {client.status || "lead"}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Contract Value</CardTitle>
                                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ${client.contract_value ? Number(client.contract_value).toLocaleString() : "0"}
                                </div>
                            </CardContent>
                        </Card>
                        {client.category && (
                            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</CardTitle>
                                    <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {client.category}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    {client.description && (
                        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 dark:text-slate-400">{client.description}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="chat" className="h-full">
                    {chatData ? (
                        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                            <CardContent className="p-0">
                                <ChatInterface 
                                    conversationId={chatData.conversation.id}
                                    initialMessages={chatData.messages}
                                    currentUserId={ADMIN_USER_ID}
                                    className="h-[600px]"
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                            <CardContent className="py-10 text-center text-slate-500 dark:text-slate-400">
                                No client space found. Please onboard the client first to enable chat.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                
                <TabsContent value="tasks">
                    <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                        <CardContent className="py-10 text-center text-slate-500 dark:text-slate-400">
                            Task management for specific client view coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="files">
                    <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                        <CardContent>
                            <FileManager clientId={client.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
