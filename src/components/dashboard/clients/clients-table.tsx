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
      <div className="rounded-xl border border-[#EDEDED] bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-[#EDEDED]">
            <TableRow className="hover:bg-transparent border-[#EDEDED]">
              <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">Client</TableHead>
              <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">Status</TableHead>
              <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">Email</TableHead>
              <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">Joined</TableHead>
              <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center font-primary text-[#606170]">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-[#EDEDED] transition-colors border-[#EDEDED] group">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={client.logo_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-[#0A33C6] to-[#0A33C6] text-white font-medium">
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold font-primary text-[#02041D]">{client.company_name || "No Company"}</div>
                        <div className="text-sm font-primary text-[#606170]">{client.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                            capitalize font-medium border-0 px-2.5 py-0.5
                            ${client.status === 'active' ? 'bg-[#EDEDED] text-emerald-700' : ''}
                            ${client.status === 'pending' ? 'bg-[#EDEDED] text-orange-700' : ''}
                            ${client.status === 'inactive' ? 'bg-[#EDEDED] font-primary text-[#606170]' : ''}
                        `}
                    >
                      {client.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-primary text-[#606170]">{client.email || '-'}</TableCell>
                  <TableCell className="font-primary text-[#606170]">
                    {client.created_at ? format(new Date(client.created_at), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 font-primary text-[#606170] hover:font-primary text-[#02041D]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clients/${client.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-[#0A33C6]" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4 text-[#0A33C6]" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
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
        <DialogContent className="bg-white border-[#EDEDED]">
          <DialogHeader>
            <DialogTitle className="font-primary text-[#02041D]">Edit Client</DialogTitle>
            <DialogDescription className="font-primary text-[#606170]">
              Update the client's information below.
            </DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-primary text-[#02041D]">Contact Name</Label>
                <Input
                  id="name"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company" className="font-primary text-[#02041D]">Company Name</Label>
                <Input
                  id="company"
                  value={editingClient.company_name || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, company_name: e.target.value })}
                  className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-primary text-[#02041D]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingClient.email || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="font-primary text-[#02041D]">Status</Label>
                <Select
                  value={editingClient.status || 'pending'}
                  onValueChange={(value) => setEditingClient({ ...editingClient, status: value })}
                >
                  <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
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
              className="border-[#EDEDED] font-primary text-[#02041D] hover:bg-[#EDEDED]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={loading}
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white"
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
        <DialogContent className="bg-white border-[#EDEDED]">
          <DialogHeader>
            <DialogTitle className="font-primary text-[#02041D]">Delete Client</DialogTitle>
            <DialogDescription className="font-primary text-[#606170]">
              Are you sure you want to delete this client? This action cannot be undone.
              All related data (portal, conversations, files) will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeletingClientId(null)}
              className="border-[#EDEDED] font-primary text-[#02041D] hover:bg-[#EDEDED]"
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
