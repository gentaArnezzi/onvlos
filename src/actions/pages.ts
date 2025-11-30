"use server";

import { db } from "@/lib/db";
import { pages, page_domains, workspaces } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";

export async function getPages() {
  try {
    const session = await getSession();
    if (!session) return { pages: [] };

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return { pages: [] };

    const pagesList = await db.select()
      .from(pages)
      .where(eq(pages.workspace_id, workspace.id))
      .orderBy(desc(pages.updated_at));

    return { pages: pagesList };
  } catch (error) {
    console.error("Failed to get pages:", error);
    return { pages: [] };
  }
}

export async function getPage(pageId: string) {
  try {
    const session = await getSession();
    if (!session) return null;

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return null;

    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.workspace_id, workspace.id)
      ),
    });

    if (!page) return null;

    // Get domain if exists
    const domain = await db.query.page_domains.findFirst({
      where: eq(page_domains.page_id, pageId),
    });

    return {
      ...page,
      domain: domain || null,
    };
  } catch (error) {
    console.error("Failed to get page:", error);
    return null;
  }
}

export async function createPage(data: {
  name: string;
  page_type: string;
  template_id?: string;
  content?: any;
  styles?: any;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // Generate public URL
    const publicUrl = `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomUUID().substring(0, 8)}`;

    const [newPage] = await db.insert(pages).values({
      workspace_id: workspace.id,
      name: data.name,
      page_type: data.page_type,
      template_id: data.template_id || null,
      content: data.content || {},
      styles: data.styles || {},
      published: false,
      public_url: publicUrl,
      created_by_user_id: session.user.id,
    }).returning();

    revalidatePath("/dashboard/pages");
    return { success: true, page: newPage };
  } catch (error) {
    console.error("Failed to create page:", error);
    return { success: false, error: "Failed to create page" };
  }
}

export async function updatePage(pageId: string, data: {
  name?: string;
  content?: any;
  styles?: any;
  seo_title?: string;
  seo_description?: string;
  favicon_url?: string;
  logo_url?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // Verify page belongs to workspace
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.workspace_id, workspace.id)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.styles !== undefined) updateData.styles = data.styles;
    if (data.seo_title !== undefined) updateData.seo_title = data.seo_title;
    if (data.seo_description !== undefined) updateData.seo_description = data.seo_description;
    if (data.favicon_url !== undefined) updateData.favicon_url = data.favicon_url;
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;

    const [updatedPage] = await db.update(pages)
      .set(updateData)
      .where(eq(pages.id, pageId))
      .returning();

    revalidatePath("/dashboard/pages");
    revalidatePath(`/dashboard/pages/${pageId}`);
    return { success: true, page: updatedPage };
  } catch (error) {
    console.error("Failed to update page:", error);
    return { success: false, error: "Failed to update page" };
  }
}

export async function publishPage(pageId: string, published: boolean) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    const updateData: any = {
      published,
      updated_at: new Date(),
    };

    if (published) {
      updateData.published_at = new Date();
    }

    await db.update(pages)
      .set(updateData)
      .where(and(
        eq(pages.id, pageId),
        eq(pages.workspace_id, workspace.id)
      ));

    revalidatePath("/dashboard/pages");
    revalidatePath(`/dashboard/pages/${pageId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to publish page:", error);
    return { success: false, error: "Failed to publish page" };
  }
}

export async function deletePage(pageId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    await db.delete(pages)
      .where(and(
        eq(pages.id, pageId),
        eq(pages.workspace_id, workspace.id)
      ));

    revalidatePath("/dashboard/pages");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete page:", error);
    return { success: false, error: "Failed to delete page" };
  }
}

export async function addCustomDomain(pageId: string, domain: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // Verify page belongs to workspace
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.workspace_id, workspace.id)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    // Generate DNS records for verification
    const dnsRecords = {
      txt: [`onvlo-verify=${crypto.randomUUID()}`],
      a: [],
      cname: [],
    };

    const [newDomain] = await db.insert(page_domains).values({
      page_id: pageId,
      domain,
      dns_records: dnsRecords,
      verified: false,
    }).returning();

    revalidatePath(`/dashboard/pages/${pageId}`);
    return { success: true, domain: newDomain };
  } catch (error) {
    console.error("Failed to add custom domain:", error);
    return { success: false, error: "Failed to add custom domain" };
  }
}

export async function verifyDomain(domainId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // TODO: Implement actual DNS verification
    // For now, just mark as verified
    await db.update(page_domains)
      .set({
        verified: true,
        verified_at: new Date(),
      })
      .where(eq(page_domains.id, domainId));

    return { success: true };
  } catch (error) {
    console.error("Failed to verify domain:", error);
    return { success: false, error: "Failed to verify domain" };
  }
}

export async function getPublicPage(publicUrl: string) {
  try {
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.public_url, publicUrl),
        eq(pages.published, true)
      ),
    });

    return page;
  } catch (error) {
    console.error("Failed to get public page:", error);
    return null;
  }
}

