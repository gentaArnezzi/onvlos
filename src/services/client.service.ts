import { db } from "@/lib/db";
import { client_companies, client_spaces } from "@/lib/db/schema";
import { eq, and, desc, like, or } from "drizzle-orm";
import type { CreateClientInput, UpdateClientInput } from "@/lib/validators/client";
import { triggerWorkflows } from "@/lib/workflows/engine";

export class ClientService {
  static async create(data: CreateClientInput) {
    const [client] = await db
      .insert(client_companies)
      .values({
        workspace_id: data.workspace_id,
        name: data.name,
        email: data.email || null,
        company_name: data.company_name || null,
        category: data.category || null,
        description: data.description || null,
        logo_url: data.logo_url || null,
        status: data.status || "lead",
        contract_value: data.contract_value || null,
        contract_start: data.contract_start || null,
        contract_end: data.contract_end || null,
        owner_user_id: data.owner_user_id || null,
      })
      .returning();

    // Trigger workflow "new_client_created"
    await triggerWorkflows("new_client_created", {
        client_id: client.id,
        workspace_id: data.workspace_id,
        client_name: data.name,
        client_email: data.email,
        company_name: data.company_name,
    });

    return client;
  }

  static async getById(clientId: string, workspaceId?: string) {
    const conditions = [eq(client_companies.id, clientId)];
    if (workspaceId) {
      conditions.push(eq(client_companies.workspace_id, workspaceId));
    }

    const [client] = await db
      .select()
      .from(client_companies)
      .where(and(...conditions))
      .limit(1);

    return client || null;
  }

  static async getByWorkspace(
    workspaceId: string,
    options?: {
      status?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const conditions = [eq(client_companies.workspace_id, workspaceId)];

    if (options?.status) {
      conditions.push(eq(client_companies.status, options.status));
    }

    if (options?.search) {
      conditions.push(
        or(
          like(client_companies.name, `%${options.search}%`),
          like(client_companies.email, `%${options.search}%`),
          like(client_companies.company_name, `%${options.search}%`)
        )
      );
    }

    let query = db
      .select()
      .from(client_companies)
      .where(and(...conditions))
      .orderBy(desc(client_companies.created_at));

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  static async update(clientId: string, data: UpdateClientInput) {
    const [updated] = await db
      .update(client_companies)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(client_companies.id, clientId))
      .returning();

    return updated || null;
  }

  static async delete(clientId: string) {
    await db.delete(client_companies).where(eq(client_companies.id, clientId));
  }

  static async createClientSpace(
    workspaceId: string,
    clientId: string,
    publicUrl: string,
    options?: {
      custom_domain?: string;
      logo_url?: string;
      branding?: any;
    }
  ) {
    const [space] = await db
      .insert(client_spaces)
      .values({
        workspace_id: workspaceId,
        client_id: clientId,
        public_url: publicUrl,
        custom_domain: options?.custom_domain || null,
        logo_url: options?.logo_url || null,
        branding: options?.branding || null,
      })
      .returning();

    return space;
  }

  static async getClientSpaceBySlug(workspaceId: string, slug: string) {
    const [space] = await db
      .select()
      .from(client_spaces)
      .where(
        and(
          eq(client_spaces.workspace_id, workspaceId),
          eq(client_spaces.public_url, slug)
        )
      )
      .limit(1);

    return space || null;
  }
}

