import { getClientSpace } from "@/actions/portal";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, FileText, Receipt, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getConversation } from "@/actions/chat";
import { ChatInterface } from "@/components/chat/chat-interface";
import { FileManager } from "@/components/dashboard/files/file-manager";

export default async function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params in Next.js 15+
  const { slug } = await params;
  const data = await getClientSpace(slug);

  if (!data) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <h1 className="text-2xl font-bold">Portal Not Found</h1>
            <p className="text-muted-foreground">This client portal does not exist or you do not have access.</p>
        </div>
    );
  }

  const { client, space, tasks, invoices } = data;
  const chatData = await getConversation(space.id);
  
  // Mock client user ID for chat
  const CLIENT_USER_ID = "client-user-id"; 

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold">Welcome, {client.company_name}</h1>
        <p className="text-muted-foreground">Here is the current status of your project.</p>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Chat
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Files
            </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription>Action items and progress tracking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No tasks assigned yet.</p>
                        ) : (
                            tasks.map(task => (
                                <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-0.5">
                                            {task.status === 'done' ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{task.title}</div>
                                            {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                                        </div>
                                    </div>
                                    <Badge variant={task.status === 'done' ? 'default' : 'secondary'}>
                                        {task.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
             {chatData ? (
                <ChatInterface 
                    conversationId={chatData.conversation.id}
                    initialMessages={chatData.messages}
                    currentUserId={CLIENT_USER_ID}
                    className="h-[600px] bg-white"
                />
            ) : (
                <Card>
                    <CardContent className="py-8 text-center">Chat unavailable</CardContent>
                </Card>
            )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Billing history and outstanding payments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {invoices.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No invoices generated yet.</p>
                        ) : (
                            invoices.map(invoice => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <Receipt className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{invoice.invoice_number}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="font-bold">
                                            ${Number(invoice.total_amount).toLocaleString()}
                                        </div>
                                        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'outline'}>
                                            {invoice.status}
                                        </Badge>
                                        {invoice.status !== 'paid' && (
                                            <Button size="sm" asChild>
                                                <a href={`/portal/${slug}/invoices/${invoice.id}/payment`}>Pay Now</a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
             <FileManager clientId={space.client_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
