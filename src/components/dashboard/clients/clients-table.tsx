"use client";

import { useState } from "react";
import { deleteClient, updateClient } from "@/actions/clients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { MoreVertical, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  email: string | null;
  company_name: string | null;
  status: string | null;
  logo_url?: string | null;
  created_at: Date | null;
  [key: string]: any; // Allow additional properties
}

export function ClientsTable({ clients: initialClients }: { clients: Client[] }) {
  const [clients, setClients] = useState(initialClients);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleUpdate = async () => {
    if (!editingClient) return;
    setLoading(true);

    const result = await updateClient(editingClient.id, {
      name: editingClient.name,
      email: editingClient.email || undefined,
      company_name: editingClient.company_name || undefined,
      status: editingClient.status || undefined,
    });

    if (result.success) {
      setClients(clients.map(c =>
        c.id === editingClient.id ? editingClient : c
      ));
      setEditingClient(null);
    } else {
      alert("Failed to update client");
    }
    setLoading(false);
  };

  const handleDelete = async (clientId: string) => {
    setLoading(true);
    const result = await deleteClient(clientId);

    if (result.success) {
      setClients(clients.filter(c => c.id !== clientId));
      setDeletingClientId(null);
    } else {
      alert("Failed to delete client");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="w-[300px] pl-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</TableHead>
              <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</TableHead>
              <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</TableHead>
              <TableHead className="text-right pr-6 h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800 group">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm">
                        <AvatarImage src={client.logo_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{client.company_name || "No Company"}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{client.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                            capitalize font-medium border-0 px-2.5 py-0.5
                            ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                            ${client.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                            ${client.status === 'inactive' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' : ''}
                        `}
                    >
                      {client.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{client.email || '-'}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {client.created_at ? format(new Date(client.created_at), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clients/${client.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-blue-500" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4 text-amber-500" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                          onClick={() => setDeletingClientId(client.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Edit Client</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Update the client's information below.
            </DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-900 dark:text-white">Contact Name</Label>
                <Input
                  id="name"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company" className="text-slate-900 dark:text-white">Company Name</Label>
                <Input
                  id="company"
                  value={editingClient.company_name || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, company_name: e.target.value })}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-900 dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingClient.email || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-slate-900 dark:text-white">Status</Label>
                <Select
                  value={editingClient.status || 'pending'}
                  onValueChange={(value) => setEditingClient({ ...editingClient, status: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingClient(null)}
              className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingClientId} onOpenChange={(open) => !open && setDeletingClientId(null)}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Delete Client</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this client? This action cannot be undone.
              All related data (portal, conversations, files) will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeletingClientId(null)}
              className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingClientId && handleDelete(deletingClientId)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
