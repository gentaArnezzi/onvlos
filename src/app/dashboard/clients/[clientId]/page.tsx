import { getConversation, getClientSpaceId } from "@/actions/chat";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageSquare, FileText, CheckSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { client_companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FileManager } from "@/components/dashboard/files/file-manager";

// Mock user ID for dashboard (Admin)
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000"; 

export default async function ClientDetailPage({ params }: { params: { clientId: string } }) {
    // Fetch Client Info
    const client = await db.query.client_companies.findFirst({
        where: eq(client_companies.id, params.clientId)
    });

    if (!client) return notFound();

    const spaceId = await getClientSpaceId(client.id);
    let chatData = null;

    if (spaceId) {
        chatData = await getConversation(spaceId);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{client.company_name}</h2>
                    <p className="text-muted-foreground">{client.name} • {client.email}</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">{client.status}</div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${client.contract_value || "0"}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="chat" className="h-full">
                    {chatData ? (
                        <ChatInterface 
                            conversationId={chatData.conversation.id}
                            initialMessages={chatData.messages}
                            currentUserId={ADMIN_USER_ID}
                            className="h-[600px]"
                        />
                    ) : (
                        <Card>
                            <CardContent className="py-10 text-center text-muted-foreground">
                                No client space found. Please onboard the client first to enable chat.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                
                 <TabsContent value="tasks">
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            Task management for specific client view coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="files">
                    <FileManager clientId={client.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
