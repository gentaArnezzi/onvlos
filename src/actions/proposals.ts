"use server";

import { db } from "@/lib/db";
import { proposals, proposal_items, contracts, signature_logs } from "@/lib/db/schema-proposals";
import { workspaces, client_companies } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

// Get all proposals
export async function getProposals() {
  try {
    const session = await getSession();
    if (!session) return [];
    
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) return [];
    
    const proposalsList = await db.select({
      id: proposals.id,
      title: proposals.title,
      proposal_number: proposals.proposal_number,
      status: proposals.status,
      client_id: proposals.client_id,
      client_name: client_companies.name,
      client_email: client_companies.email,
      total: proposals.total,
      valid_until: proposals.valid_until,
      created_at: proposals.created_at,
      sent_at: proposals.sent_at,
      viewed_at: proposals.viewed_at,
      accepted_at: proposals.accepted_at
    })
    .from(proposals)
    .leftJoin(client_companies, eq(proposals.client_id, client_companies.id))
    .where(eq(proposals.workspace_id, workspace.id))
    .orderBy(desc(proposals.created_at));
    
    return proposalsList;
  } catch (error) {
    console.error("Failed to fetch proposals:", error);
    return [];
  }
}

// Create a new proposal
export async function createProposal(data: {
  client_id: string;
  title: string;
  content: any;
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
  valid_days?: number;
}) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");
    
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) throw new Error("No workspace found");
    
    // Generate proposal number
    const proposalCount = await db.select().from(proposals).where(eq(proposals.workspace_id, workspace.id));
    const proposalNumber = `PROP-${new Date().getFullYear()}-${String(proposalCount.length + 1).padStart(4, '0')}`;
    
    // Generate public URL slug
    const slug = `${proposalNumber.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Calculate totals if items provided
    let subtotal = 0;
    if (data.items && data.items.length > 0) {
      subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    }
    
    // Set validity period
    const validUntil = data.valid_days 
      ? new Date(Date.now() + data.valid_days * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
    
    const [newProposal] = await db.insert(proposals).values({
      workspace_id: workspace.id,
      client_id: data.client_id,
      title: data.title,
      proposal_number: proposalNumber,
      content: data.content,
      subtotal: subtotal.toString(),
      total: subtotal.toString(),
      valid_until: validUntil,
      public_url: slug,
      status: "draft"
    }).returning();
    
    // Insert proposal items if provided
    if (data.items && data.items.length > 0) {
      await db.insert(proposal_items).values(
        data.items.map((item, index) => ({
          proposal_id: newProposal.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
          total: (item.quantity * item.unit_price).toString(),
          order: index
        }))
      );
    }
    
    revalidatePath("/dashboard/proposals");
    return { success: true, proposal: newProposal };
  } catch (error) {
    console.error("Failed to create proposal:", error);
    return { success: false, error: "Failed to create proposal" };
  }
}

// Send proposal to client
export async function sendProposal(proposalId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");
    
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) throw new Error("No workspace found");
    
    const proposal = await db.query.proposals.findFirst({
      where: and(
        eq(proposals.id, proposalId),
        eq(proposals.workspace_id, workspace.id)
      )
    });
    
    if (!proposal) throw new Error("Proposal not found or access denied");
    
    // Get client details
    const client = await db.query.client_companies.findFirst({
      where: eq(client_companies.id, proposal.client_id)
    });
    
    if (!client || !client.email) throw new Error("Client email not found");
    
    // Update proposal status
    await db.update(proposals)
      .set({
        status: "sent",
        sent_at: new Date(),
        updated_at: new Date()
      })
      .where(eq(proposals.id, proposalId));
    
    // Send email
    const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/proposal/${proposal.public_url}`;
    await sendEmail(client.email, 'invoiceCreated', {
      clientName: client.name || 'Client',
      invoiceNumber: proposal.proposal_number,
      amount: `$${proposal.total}`,
      dueDate: proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString() : '',
      viewUrl: proposalUrl
    });
    
    revalidatePath("/dashboard/proposals");
    return { success: true };
  } catch (error) {
    console.error("Failed to send proposal:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send proposal" };
  }
}

// Accept proposal
export async function acceptProposal(
  proposalId: string, 
  signature: string,
  signerName: string,
  signerEmail: string
) {
  try {
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, proposalId)
    });
    
    if (!proposal) throw new Error("Proposal not found");
    
    // Update proposal
    await db.update(proposals)
      .set({
        status: "accepted",
        accepted_at: new Date(),
        signed_at: new Date(),
        signature_data: signature,
        signer_name: signerName,
        signer_email: signerEmail,
        updated_at: new Date()
      })
      .where(eq(proposals.id, proposalId));
    
    // Log signature
    await db.insert(signature_logs).values({
      document_type: "proposal",
      document_id: proposalId,
      signer_name: signerName,
      signer_email: signerEmail,
      signature_data: signature,
      signed_at: new Date()
    });
    
    // Convert to contract if needed
    await createContractFromProposal(proposalId);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to accept proposal:", error);
    return { success: false, error: "Failed to accept proposal" };
  }
}

// Create contract from accepted proposal
async function createContractFromProposal(proposalId: string) {
  try {
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, proposalId)
    });
    
    if (!proposal || proposal.status !== "accepted") return;
    
    // Generate contract number
    const contractCount = await db.select().from(contracts).where(eq(contracts.workspace_id, proposal.workspace_id));
    const contractNumber = `CONT-${new Date().getFullYear()}-${String(contractCount.length + 1).padStart(4, '0')}`;
    
    // Generate public URL
    const slug = `${contractNumber.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Create contract
    await db.insert(contracts).values({
      workspace_id: proposal.workspace_id,
      client_id: proposal.client_id,
      proposal_id: proposalId,
      title: `Contract - ${proposal.title}`,
      contract_number: contractNumber,
      content: {
        sections: [
          {
            id: "1",
            type: "header",
            content: `Contract Agreement`,
            order: 0
          },
          {
            id: "2",
            type: "clause",
            title: "Scope of Work",
            content: "Based on the accepted proposal " + proposal.proposal_number,
            order: 1
          },
          {
            id: "3",
            type: "terms",
            title: "Terms and Conditions",
            content: "Standard terms and conditions apply.",
            order: 2
          }
        ]
      },
      parties: [
        {
          id: "1",
          type: "company",
          name: "Your Company",
          email: "company@example.com",
          role: "Service Provider",
          signed: false
        },
        {
          id: "2",
          type: "individual",
          name: proposal.signer_name || "",
          email: proposal.signer_email || "",
          role: "Client",
          signed: true,
          signature_data: proposal.signature_data || "",
          signed_at: proposal.signed_at?.toISOString()
        }
      ],
      public_url: slug,
      effective_date: new Date(),
      status: "sent"
    });
    
  } catch (error) {
    console.error("Failed to create contract from proposal:", error);
  }
}

// Get all contracts
export async function getContracts() {
  try {
    const session = await getSession();
    if (!session) return [];
    
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) return [];
    
    const contractsList = await db.select({
      id: contracts.id,
      title: contracts.title,
      contract_number: contracts.contract_number,
      status: contracts.status,
      client_id: contracts.client_id,
      client_name: client_companies.name,
      effective_date: contracts.effective_date,
      fully_signed: contracts.fully_signed,
      created_at: contracts.created_at
    })
    .from(contracts)
    .leftJoin(client_companies, eq(contracts.client_id, client_companies.id))
    .where(eq(contracts.workspace_id, workspace.id))
    .orderBy(desc(contracts.created_at));
    
    return contractsList;
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    return [];
  }
}
