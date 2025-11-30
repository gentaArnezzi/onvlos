"use server";

import { db } from "@/lib/db";
import { proposals, proposal_items, contracts, signature_logs } from "@/lib/db/schema-proposals";
import { workspaces, client_companies } from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
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

// Accept proposal (called by client from public URL)
export async function acceptProposal(
  proposalId: string, 
  signature: string = "",
  signerName: string = "",
  signerEmail: string = ""
) {
  try {
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, proposalId)
    });
    
    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }
    
    // Only allow acceptance if proposal is sent (not draft)
    if (proposal.status !== "sent") {
      return { success: false, error: "Proposal must be sent before it can be accepted" };
    }
    
    // Check if already accepted or declined
    if (proposal.status === "accepted") {
      return { success: false, error: "Proposal has already been accepted" };
    }
    
    if (proposal.status === "declined") {
      return { success: false, error: "Proposal has already been declined" };
    }
    
    // Check if expired
    if (proposal.valid_until && new Date(proposal.valid_until) < new Date()) {
      return { success: false, error: "Proposal has expired" };
    }
    
    // Get client info for signer details if not provided
    const client = await db.query.client_companies.findFirst({
      where: eq(client_companies.id, proposal.client_id)
    });
    
    const finalSignerName = signerName || client?.name || client?.company_name || "Client";
    const finalSignerEmail = signerEmail || client?.email || "";
    
    // Update proposal
    await db.update(proposals)
      .set({
        status: "accepted",
        accepted_at: new Date(),
        signed_at: new Date(),
        signature_data: signature || null,
        signer_name: finalSignerName,
        signer_email: finalSignerEmail,
        updated_at: new Date()
      })
      .where(eq(proposals.id, proposalId));
    
    // Log signature if provided
    if (signature) {
      await db.insert(signature_logs).values({
        document_type: "proposal",
        document_id: proposalId,
        signer_name: finalSignerName,
        signer_email: finalSignerEmail,
        signature_data: signature,
        signed_at: new Date()
      });
    }
    
    // Convert to contract
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
    
    // Get workspace info for party 1
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, proposal.workspace_id)
    });
    
    // Get client info for party 2
    const client = await db.query.client_companies.findFirst({
      where: eq(client_companies.id, proposal.client_id)
    });
    
    // Generate contract number
    const contractCount = await db.select().from(contracts).where(eq(contracts.workspace_id, proposal.workspace_id));
    const contractNumber = `CONT-${new Date().getFullYear()}-${String(contractCount.length + 1).padStart(4, '0')}`;
    
    // Generate public URL
    const slug = `${contractNumber.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Build content sections from proposal content if available, otherwise use default
    let contentSections = [];
    if (proposal.content && proposal.content.sections && Array.isArray(proposal.content.sections)) {
      // Convert proposal sections to contract sections
      contentSections = proposal.content.sections
        .filter((s: any) => s.type !== 'pricing' && s.type !== 'invoice') // Exclude pricing/invoice sections
        .map((s: any, index: number) => ({
          id: String(index + 1),
          type: s.type === 'header' ? 'header' : s.type === 'text' ? 'clause' : 'terms',
          title: s.title || s.content?.title,
          content: typeof s.content === 'string' ? s.content : s.content?.text || s.content?.content || '',
          order: index
        }));
    }
    
    // If no sections from proposal, use default
    if (contentSections.length === 0) {
      contentSections = [
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
      ];
    }
    
    // Build parties array
    const parties = [
      {
        id: "1",
        type: "company" as const,
        name: workspace?.name || "Service Provider",
        email: workspace?.billing_email || "",
        role: "Service Provider",
        signed: false
      },
      {
        id: "2",
        type: "individual" as const,
        name: proposal.signer_name || client?.name || client?.company_name || "Client",
        email: proposal.signer_email || client?.email || "",
        role: "Client",
        signed: proposal.signed_at ? true : false,
        signature_data: proposal.signature_data || undefined,
        signed_at: proposal.signed_at?.toISOString() || undefined
      }
    ];
    
    // Set effective_date from proposal accepted_at, expiry_date from proposal valid_until
    const effectiveDate = proposal.accepted_at || new Date();
    const expiryDate = proposal.valid_until || null;
    
    // Create contract
    await db.insert(contracts).values({
      workspace_id: proposal.workspace_id,
      client_id: proposal.client_id,
      proposal_id: proposalId,
      title: `Contract - ${proposal.title}`,
      contract_number: contractNumber,
      content: {
        sections: contentSections
      },
      parties: parties,
      public_url: slug,
      effective_date: effectiveDate,
      expiry_date: expiryDate,
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

// Get contract by ID or public_url (for public viewing)
export async function getContractByIdOrSlug(idOrSlug: string) {
  try {
    // Try to find by ID first
    let contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, idOrSlug)
    });

    // If not found by ID, try by public_url
    if (!contract) {
      contract = await db.query.contracts.findFirst({
        where: eq(contracts.public_url, idOrSlug)
      });
    }

    if (!contract) {
      return null;
    }

    // Get client info
    const client = await db.query.client_companies.findFirst({
      where: eq(client_companies.id, contract.client_id)
    });

    // Get proposal info if exists
    let proposal = null;
    if (contract.proposal_id) {
      proposal = await db.query.proposals.findFirst({
        where: eq(proposals.id, contract.proposal_id)
      });
    }

    // Update view count and viewed_at if not already viewed
    // Only update status to "viewed" if contract is already "sent" (not draft)
    if (!contract.viewed_at && contract.status === "sent") {
      await db.update(contracts)
        .set({
          viewed_at: new Date(),
          view_count: (contract.view_count || 0) + 1,
          status: "viewed",
          updated_at: new Date()
        })
        .where(eq(contracts.id, contract.id));
    } else {
      // Just increment view count (don't change status)
      await db.update(contracts)
        .set({
          view_count: (contract.view_count || 0) + 1,
          updated_at: new Date()
        })
        .where(eq(contracts.id, contract.id));
    }

    return {
      ...contract,
      client,
      proposal
    };
  } catch (error) {
    console.error("Failed to fetch contract:", error);
    return null;
  }
}

// Send contract to client
export async function sendContract(contractId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");
    
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });
    
    if (!workspace) throw new Error("No workspace found");
    
    const contract = await db.query.contracts.findFirst({
      where: and(
        eq(contracts.id, contractId),
        eq(contracts.workspace_id, workspace.id)
      )
    });
    
    if (!contract) throw new Error("Contract not found or access denied");
    
    // Get client details
    const client = await db.query.client_companies.findFirst({
      where: eq(client_companies.id, contract.client_id)
    });
    
    if (!client || !client.email) throw new Error("Client email not found");
    
    // Update contract status
    await db.update(contracts)
      .set({
        status: "sent",
        sent_at: new Date(),
        updated_at: new Date()
      })
      .where(eq(contracts.id, contractId));
    
    // Send email
    const contractUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contract/${contract.public_url}`;
    await sendEmail(client.email, 'invoiceCreated', {
      clientName: client.name || 'Client',
      invoiceNumber: contract.contract_number,
      amount: '',
      dueDate: contract.effective_date ? new Date(contract.effective_date).toLocaleDateString() : '',
      viewUrl: contractUrl
    });
    
    revalidatePath("/dashboard/proposals");
    return { success: true };
  } catch (error) {
    console.error("Failed to send contract:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send contract" };
  }
}

// Sign contract (called by client or agency)
export async function signContract(
  contractId: string,
  partyId: string,
  signature: string = "",
  signerName: string = "",
  signerEmail: string = ""
) {
  try {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });
    
    if (!contract) {
      return { success: false, error: "Contract not found" };
    }
    
    // Only allow signing if contract is sent or viewed
    if (contract.status !== "sent" && contract.status !== "viewed") {
      return { success: false, error: "Contract must be sent before it can be signed" };
    }
    
    // Check if already fully signed
    if (contract.fully_signed) {
      return { success: false, error: "Contract has already been fully signed" };
    }
    
    // Update parties array
    const parties = Array.isArray(contract.parties) ? [...contract.parties] : [];
    const partyIndex = parties.findIndex((p: any) => p.id === partyId);
    
    if (partyIndex === -1) {
      return { success: false, error: "Party not found" };
    }
    
    // Update party signature
    parties[partyIndex] = {
      ...parties[partyIndex],
      signed: true,
      signature_data: signature || parties[partyIndex].signature_data,
      signed_at: new Date().toISOString(),
      name: signerName || parties[partyIndex].name,
      email: signerEmail || parties[partyIndex].email
    };
    
    // Check if all parties have signed
    const allSigned = parties.every((p: any) => p.signed === true);
    
    // Update contract
    await db.update(contracts)
      .set({
        parties: parties,
        fully_signed: allSigned,
        fully_signed_at: allSigned ? new Date() : null,
        status: allSigned ? "signed" : contract.status,
        updated_at: new Date()
      })
      .where(eq(contracts.id, contractId));
    
    // Log signature if provided
    if (signature) {
      await db.insert(signature_logs).values({
        document_type: "contract",
        document_id: contractId,
        signer_name: signerName || parties[partyIndex].name,
        signer_email: signerEmail || parties[partyIndex].email,
        signature_data: signature,
        signed_at: new Date()
      });
    }
    
    return { success: true, fullySigned: allSigned };
  } catch (error) {
    console.error("Failed to sign contract:", error);
    return { success: false, error: "Failed to sign contract" };
  }
}

// Decline proposal (called by client from public URL)
export async function declineProposal(proposalId: string, reason: string) {
  try {
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, proposalId)
    });
    
    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }
    
    // Only allow decline if proposal is sent (not draft)
    if (proposal.status !== "sent") {
      return { success: false, error: "Proposal must be sent before it can be declined" };
    }
    
    if (proposal.status === "accepted") {
      return { success: false, error: "Proposal has already been accepted and cannot be declined" };
    }
    
    if (proposal.status === "declined") {
      return { success: false, error: "Proposal has already been declined" };
    }
    
    await db.update(proposals)
      .set({
        status: "declined",
        declined_at: new Date(),
        decline_reason: reason,
        updated_at: new Date()
      })
      .where(eq(proposals.id, proposalId));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to decline proposal:", error);
    return { success: false, error: "Failed to decline proposal" };
  }
}

// Get proposal by ID or public_url (for public viewing)
export async function getProposalByIdOrSlug(idOrSlug: string) {
  try {
    // Try to find by ID first
    let proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, idOrSlug)
    });

    // If not found by ID, try by public_url
    if (!proposal) {
      proposal = await db.query.proposals.findFirst({
        where: eq(proposals.public_url, idOrSlug)
      });
    }

    if (!proposal) {
      return null;
    }

    // Get client info
    const client = await db.query.client_companies.findFirst({
      where: eq(client_companies.id, proposal.client_id)
    });

    // Get proposal items
    const items = await db.select().from(proposal_items)
      .where(eq(proposal_items.proposal_id, proposal.id))
      .orderBy(asc(proposal_items.order));

    // Update view count and viewed_at if not already viewed
    // Only update status to "viewed" if proposal is already "sent" (not draft)
    if (!proposal.viewed_at && proposal.status === "sent") {
      await db.update(proposals)
        .set({
          viewed_at: new Date(),
          view_count: (proposal.view_count || 0) + 1,
          status: "viewed",
          updated_at: new Date()
        })
        .where(eq(proposals.id, proposal.id));
    } else {
      // Just increment view count (don't change status)
      await db.update(proposals)
        .set({
          view_count: (proposal.view_count || 0) + 1,
          updated_at: new Date()
        })
        .where(eq(proposals.id, proposal.id));
    }

    return {
      ...proposal,
      client,
      items
    };
  } catch (error) {
    console.error("Failed to fetch proposal:", error);
    return null;
  }
}
