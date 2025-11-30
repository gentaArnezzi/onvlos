import { getClientSpace } from "@/actions/portal";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, FileText, Receipt, MessageSquare, Calendar, TrendingUp, Clock, AlertCircle, FileSignature } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getConversationForPortal } from "@/actions/chat";
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

  const { client, space, tasks, invoices, contracts } = data;
  const chatData = await getConversationForPortal(space.id);
  
  // Portal client user ID - will be resolved in getConversationForPortal
  // We use a format that can be matched in the component
  const CLIENT_USER_ID = `portal-user-${space.id}`; 

  // Calculate stats for summary
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const pendingInvoices = invoices.filter(i => i.status !== 'paid').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const activeContracts = contracts.filter(c => c.status === 'sent' || c.status === 'viewed' || c.status === 'signed').length;
  const fullySignedContracts = contracts.filter(c => c.fully_signed).length;

  return (
    <div className="space-y-8">
      {/* Welcome Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0731c2] via-[#0731c2] to-[#010119] dark:from-[#0731c2] dark:via-[#0731c2] dark:to-[#010119] p-8 rounded-xl shadow-lg">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {client.company_name || client.name}</h1>
          <p className="text-blue-100 text-lg">Here's the current status of your project.</p>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-lg">
            <TabsTrigger value="summary" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700 dark:text-slate-300">
                <TrendingUp className="h-4 w-4" /> Summary
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700 dark:text-slate-300">
                <MessageSquare className="h-4 w-4" /> Chat
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700 dark:text-slate-300">
                <Receipt className="h-4 w-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700 dark:text-slate-300">
                <FileText className="h-4 w-4" /> Files
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700 dark:text-slate-300">
                <FileSignature className="h-4 w-4" /> Contracts
            </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Tasks Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {completedTasks} / {totalTasks}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% complete
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Invoices</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {pendingInvoices}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {overdueInvoices}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Paid</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  All time payments
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Contracts</CardTitle>
                <FileSignature className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeContracts}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {fullySignedContracts} fully signed
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Project Tasks</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">Action items and progress tracking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="text-center py-12">
                                <Circle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 mt-2">No tasks assigned yet.</p>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <div key={task.id} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="mt-0.5">
                                            {task.status === 'done' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 dark:text-white">{task.title}</div>
                                            {task.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                                            )}
                                            {task.due_date && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-500">
                                                    <Calendar className="h-3 w-3" />
                                                    Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge 
                                        variant={task.status === 'done' ? 'default' : 'secondary'}
                                        className="ml-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                    >
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
                    isPortal={true}
                />
            ) : (
                <Card>
                    <CardContent className="py-8 text-center">Chat unavailable</CardContent>
                </Card>
            )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Invoices</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">Billing history and outstanding payments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-3">
                        {invoices.length === 0 ? (
                            <div className="text-center py-12">
                                <Receipt className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 mt-2">No invoices generated yet.</p>
                            </div>
                        ) : (
                            invoices.map(invoice => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#0731c2] to-[#010119] flex items-center justify-center shadow-sm">
                                            <Receipt className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white">{invoice.invoice_number}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-slate-900 dark:text-white">
                                                ${Number(invoice.total_amount).toLocaleString()}
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'outline'}
                                            className={
                                                invoice.status === 'paid' 
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                    : invoice.status === 'overdue'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                            }
                                        >
                                            {invoice.status}
                                        </Badge>
                                        {invoice.status !== 'paid' && (
                                            <Button 
                                                size="sm" 
                                                asChild
                                                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"
                                            >
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

        <TabsContent value="contracts" className="space-y-4">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Contracts</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">View and manage your contracts.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-3">
                        {contracts.length === 0 ? (
                            <div className="text-center py-12">
                                <FileSignature className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 mt-2">No contracts available yet.</p>
                            </div>
                        ) : (
                            contracts.map(contract => (
                                <div key={contract.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#0731c2] to-[#010119] flex items-center justify-center shadow-sm">
                                            <FileSignature className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white">{contract.title}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {contract.contract_number}
                                            </div>
                                            {contract.effective_date && (
                                                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                    Effective: {format(new Date(contract.effective_date), "MMM d, yyyy")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Badge 
                                            variant={contract.fully_signed ? 'default' : 'outline'}
                                            className={
                                                contract.fully_signed
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                    : contract.status === 'signed'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                            }
                                        >
                                            {contract.fully_signed ? 'Fully Signed' : contract.status}
                                        </Badge>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            asChild
                                        >
                                            <a href={`/contract/${contract.id}`} target="_blank">View</a>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

