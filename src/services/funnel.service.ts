import { db } from "@/lib/db";
import { funnels, funnel_steps, client_onboarding_sessions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { CreateFunnelInput, UpdateFunnelInput } from "@/lib/validators/funnel";

export class FunnelService {
  static generatePublicUrl(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
  }

  static async create(data: CreateFunnelInput) {
    const publicUrl =
      data.public_url || this.generatePublicUrl(data.name) + "-" + Date.now().toString(36);

    const [funnel] = await db
      .insert(funnels)
      .values({
        workspace_id: data.workspace_id,
        name: data.name,
        description: data.description || null,
        public_url: publicUrl,
        published: data.published || false,
      })
      .returning();

    return funnel;
  }

  static async getById(funnelId: string, workspaceId?: string) {
    const conditions = [eq(funnels.id, funnelId)];
    if (workspaceId) {
      conditions.push(eq(funnels.workspace_id, workspaceId));
    }

    const [funnel] = await db
      .select()
      .from(funnels)
      .where(and(...conditions))
      .limit(1);

    if (!funnel) return null;

    const steps = await db
      .select()
      .from(funnel_steps)
      .where(eq(funnel_steps.funnel_id, funnelId))
      .orderBy(funnel_steps.order);

    return { ...funnel, steps };
  }

  static async getByPublicUrl(publicUrl: string) {
    const [funnel] = await db
      .select()
      .from(funnels)
      .where(and(eq(funnels.public_url, publicUrl), eq(funnels.published, true)))
      .limit(1);

    if (!funnel) return null;

    const steps = await db
      .select()
      .from(funnel_steps)
      .where(eq(funnel_steps.funnel_id, funnel.id))
      .orderBy(funnel_steps.order);

    return { ...funnel, steps };
  }

  static async getByWorkspace(workspaceId: string) {
    const funnelsList = await db
      .select()
      .from(funnels)
      .where(eq(funnels.workspace_id, workspaceId))
      .orderBy(desc(funnels.created_at));

    return funnelsList;
  }

  static async update(funnelId: string, data: UpdateFunnelInput) {
    const [updated] = await db
      .update(funnels)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(funnels.id, funnelId))
      .returning();

    return updated || null;
  }

  static async delete(funnelId: string) {
    await db.delete(funnels).where(eq(funnels.id, funnelId));
  }

  static async createStep(
    funnelId: string,
    stepType: string,
    order: number,
    config: any
  ) {
    const [step] = await db
      .insert(funnel_steps)
      .values({
        funnel_id: funnelId,
        step_type: stepType,
        order,
        config,
      })
      .returning();

    return step;
  }

  static async updateStep(stepId: string, data: { order?: number; config?: any }) {
    const [updated] = await db
      .update(funnel_steps)
      .set(data)
      .where(eq(funnel_steps.id, stepId))
      .returning();

    return updated || null;
  }

  static async deleteStep(stepId: string) {
    await db.delete(funnel_steps).where(eq(funnel_steps.id, stepId));
  }

  static async createOnboardingSession(
    funnelId: string,
    clientEmail: string,
    magicLinkToken?: string
  ) {
    const [session] = await db
      .insert(client_onboarding_sessions)
      .values({
        funnel_id: funnelId,
        client_email: clientEmail,
        current_step: 0,
        progress_data: {},
        magic_link_token: magicLinkToken || null,
      })
      .returning();

    return session;
  }

  static async getOnboardingSession(sessionId: string) {
    const [session] = await db
      .select()
      .from(client_onboarding_sessions)
      .where(eq(client_onboarding_sessions.id, sessionId))
      .limit(1);

    return session || null;
  }

  static async updateOnboardingSession(
    sessionId: string,
    data: {
      current_step?: number;
      progress_data?: any;
      completed_at?: Date;
    }
  ) {
    const [updated] = await db
      .update(client_onboarding_sessions)
      .set(data)
      .where(eq(client_onboarding_sessions.id, sessionId))
      .returning();

    return updated || null;
  }
}

