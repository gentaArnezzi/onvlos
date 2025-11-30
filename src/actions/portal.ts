"use server";

import { db } from "@/lib/db";
import { client_spaces, client_companies, tasks, invoices, client_onboarding_sessions, funnels, portal_media, onboarding_checklist_items } from "@/lib/db/schema";
import { contracts, proposals } from "@/lib/db/schema-proposals";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";

export async function getClientSpace(slug: string) {
    const space = await db.query.client_spaces.findFirst({
        where: eq(client_spaces.public_url, slug)
    });

    if (!space) return null;

    const client = await db.select().from(client_companies).where(eq(client_companies.id, space.client_id)).limit(1);
    
    if (!client[0]) return null;

    // Verify client belongs to the same workspace as the space
    if (client[0].workspace_id !== space.workspace_id) {
        return null;
    }
    
    // Fetch Tasks - verify they belong to the workspace
    const clientTasks = await db.select()
        .from(tasks)
        .where(and(
            eq(tasks.client_id, space.client_id),
            eq(tasks.workspace_id, space.workspace_id)
        ))
        .orderBy(desc(tasks.created_at));
    
    // Fetch Invoices - verify they belong to the workspace
    const clientInvoices = await db.select()
        .from(invoices)
        .where(and(
            eq(invoices.client_id, space.client_id),
            eq(invoices.workspace_id, space.workspace_id)
        ))
        .orderBy(desc(invoices.created_at));

    // Fetch Contracts - verify they belong to the workspace
    const clientContracts = await db.select()
        .from(contracts)
        .where(and(
            eq(contracts.client_id, space.client_id),
            eq(contracts.workspace_id, space.workspace_id)
        ))
        .orderBy(desc(contracts.created_at));

    // Fetch Proposals - verify they belong to the workspace
    const clientProposals = await db.select()
        .from(proposals)
        .where(and(
            eq(proposals.client_id, space.client_id),
            eq(proposals.workspace_id, space.workspace_id)
        ))
        .orderBy(desc(proposals.created_at));

    return {
        space,
        client: client[0],
        tasks: clientTasks,
        invoices: clientInvoices,
        contracts: clientContracts,
        proposals: clientProposals
    };
}

export async function getPortalMedia(clientSpaceId: string) {
    try {
        const media = await db.select()
            .from(portal_media)
            .where(eq(portal_media.client_space_id, clientSpaceId))
            .orderBy(desc(portal_media.created_at));

        return { media };
    } catch (error) {
        console.error("Failed to get portal media:", error);
        return { media: [] };
    }
}

export async function uploadPortalMedia(formData: FormData) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const file = formData.get("file") as File;
        const clientSpaceId = formData.get("clientSpaceId") as string;

        if (!file || !clientSpaceId) {
            return { success: false, error: "Missing file or client space ID" };
        }

        // TODO: Upload file to S3/Cloudinary and get URL
        // For now, create a placeholder
        const fileUrl = `/uploads/${crypto.randomUUID()}-${file.name}`;

        await db.insert(portal_media).values({
            client_space_id: clientSpaceId,
            file_name: file.name,
            file_url: fileUrl,
            file_type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
            file_size: file.size,
            mime_type: file.type,
            uploaded_by_user_id: session.user.id,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to upload portal media:", error);
        return { success: false, error: "Failed to upload media" };
    }
}

export async function deletePortalMedia(mediaId: string) {
    try {
        await db.delete(portal_media)
            .where(eq(portal_media.id, mediaId));

        return { success: true };
    } catch (error) {
        console.error("Failed to delete portal media:", error);
        return { success: false, error: "Failed to delete media" };
    }
}

export async function getOnboardingChecklist(clientSpaceId: string) {
    try {
        const items = await db.select()
            .from(onboarding_checklist_items)
            .where(eq(onboarding_checklist_items.client_space_id, clientSpaceId))
            .orderBy(asc(onboarding_checklist_items.order));

        return { items };
    } catch (error) {
        console.error("Failed to get onboarding checklist:", error);
        return { items: [] };
    }
}

export async function updateOnboardingChecklistItem(itemId: string, completed: boolean) {
    try {
        await db.update(onboarding_checklist_items)
            .set({
                completed,
                completed_at: completed ? new Date() : null,
            })
            .where(eq(onboarding_checklist_items.id, itemId));

        return { success: true };
    } catch (error) {
        console.error("Failed to update checklist item:", error);
        return { success: false, error: "Failed to update checklist item" };
    }
}

export async function updatePortalCustomization(clientSpaceId: string, data: {
    logo_url?: string;
    banner_url?: string;
    welcome_video_url?: string;
    branding?: any;
}) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const updateData: any = {};
        if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;
        if (data.banner_url !== undefined) updateData.banner_url = data.banner_url;
        if (data.welcome_video_url !== undefined) updateData.welcome_video_url = data.welcome_video_url;
        if (data.branding !== undefined) updateData.branding = data.branding;

        await db.update(client_spaces)
            .set(updateData)
            .where(eq(client_spaces.id, clientSpaceId));

        revalidatePath(`/portal/${clientSpaceId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update portal customization:", error);
        return { success: false, error: "Failed to update customization" };
    }
}
