"use server";

import { db } from "@/lib/db";
import { documents, document_folders, document_shares, workspaces, users } from "@/lib/db/schema";
import { desc, eq, and, sql, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";
// Note: Using crypto.randomUUID() directly in the code

export async function getFolders(folderType?: string, flowId?: string, clientId?: string) {
  try {
    const session = await getSession();
    if (!session) return { folders: [] };

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return { folders: [] };

    let conditions = [eq(document_folders.workspace_id, workspace.id)];

    if (folderType) {
      conditions.push(eq(document_folders.folder_type, folderType));
    }

    if (flowId) {
      conditions.push(eq(document_folders.flow_id, flowId));
    }

    if (clientId) {
      conditions.push(eq(document_folders.client_id, clientId));
    }

    const folders = await db.select()
      .from(document_folders)
      .where(and(...conditions))
      .orderBy(desc(document_folders.updated_at));

    return { folders };
  } catch (error) {
    console.error("Failed to get folders:", error);
    return { folders: [] };
  }
}

export async function createFolder(data: {
  name: string;
  folder_type: string;
  parent_folder_id?: string;
  flow_id?: string;
  client_id?: string;
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

    const [newFolder] = await db.insert(document_folders).values({
      workspace_id: workspace.id,
      name: data.name,
      folder_type: data.folder_type,
      parent_folder_id: data.parent_folder_id || null,
      flow_id: data.flow_id || null,
      client_id: data.client_id || null,
      created_by_user_id: session.user.id,
    }).returning();

    revalidatePath("/dashboard/brain");
    return { success: true, folder: newFolder };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { success: false, error: "Failed to create folder" };
  }
}

export async function getDocuments(folderId?: string, flowId?: string, clientId?: string) {
  try {
    const session = await getSession();
    if (!session) return { documents: [] };

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return { documents: [] };

    let conditions = [eq(documents.workspace_id, workspace.id)];

    if (folderId) {
      conditions.push(eq(documents.folder_id, folderId));
    } else {
      conditions.push(isNull(documents.folder_id));
    }

    if (flowId) {
      conditions.push(eq(documents.flow_id, flowId));
    }

    if (clientId) {
      conditions.push(eq(documents.client_id, clientId));
    }

    const docs = await db.select({
      id: documents.id,
      title: documents.title,
      content: documents.content,
      file_type: documents.file_type,
      file_url: documents.file_url,
      file_size: documents.file_size,
      mime_type: documents.mime_type,
      is_public: documents.is_public,
      public_url: documents.public_url,
      created_at: documents.created_at,
      updated_at: documents.updated_at,
      created_by_user_id: documents.created_by_user_id,
      user_name: users.name,
    })
      .from(documents)
      .leftJoin(users, eq(documents.created_by_user_id, users.id))
      .where(and(...conditions))
      .orderBy(desc(documents.updated_at));

    return { documents: docs };
  } catch (error) {
    console.error("Failed to get documents:", error);
    return { documents: [] };
  }
}

export async function createDocument(data: {
  title: string;
  content?: string;
  file_type?: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  folder_id?: string;
  flow_id?: string;
  client_id?: string;
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

    // Generate public URL if needed
    const publicUrl = data.file_type === "file" && data.file_url
      ? `brain-${crypto.randomUUID()}`
      : null;

    const [newDoc] = await db.insert(documents).values({
      workspace_id: workspace.id,
      title: data.title,
      content: data.content || null,
      file_type: data.file_type || "document",
      file_url: data.file_url || null,
      file_size: data.file_size || null,
      mime_type: data.mime_type || null,
      folder_id: data.folder_id || null,
      flow_id: data.flow_id || null,
      client_id: data.client_id || null,
      is_public: false,
      public_url: publicUrl,
      created_by_user_id: session.user.id,
    }).returning();

    revalidatePath("/dashboard/brain");
    return { success: true, document: newDoc };
  } catch (error) {
    console.error("Failed to create document:", error);
    return { success: false, error: "Failed to create document" };
  }
}

export async function updateDocument(documentId: string, data: {
  title?: string;
  content?: string;
  is_public?: boolean;
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

    // Verify document belongs to workspace
    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.workspace_id, workspace.id)
      ),
    });

    if (!doc) {
      return { success: false, error: "Document not found" };
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.is_public !== undefined) {
      updateData.is_public = data.is_public;
      // Generate public URL if making public
      if (data.is_public && !doc.public_url) {
        updateData.public_url = `brain-${crypto.randomUUID()}`;
      }
    }

    const [updatedDoc] = await db.update(documents)
      .set(updateData)
      .where(eq(documents.id, documentId))
      .returning();

    revalidatePath("/dashboard/brain");
    return { success: true, document: updatedDoc };
  } catch (error) {
    console.error("Failed to update document:", error);
    return { success: false, error: "Failed to update document" };
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // Verify document belongs to workspace
    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.workspace_id, workspace.id)
      ),
    });

    if (!doc) {
      return { success: false, error: "Document not found" };
    }

    await db.delete(documents)
      .where(eq(documents.id, documentId));

    revalidatePath("/dashboard/brain");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}

export async function shareDocument(documentId: string, userId: string, permission: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // Check if share already exists
    const existing = await db.query.document_shares.findFirst({
      where: and(
        eq(document_shares.document_id, documentId),
        eq(document_shares.user_id, userId)
      ),
    });

    if (existing) {
      // Update existing share
      await db.update(document_shares)
        .set({ permission })
        .where(eq(document_shares.id, existing.id));
    } else {
      // Create new share
      await db.insert(document_shares).values({
        document_id: documentId,
        user_id: userId,
        permission,
        shared_by_user_id: session.user.id,
      });
    }

    revalidatePath("/dashboard/brain");
    return { success: true };
  } catch (error) {
    console.error("Failed to share document:", error);
    return { success: false, error: "Failed to share document" };
  }
}

export async function getPublicDocument(publicUrl: string) {
  try {
    const workspace = await getOrCreateWorkspace();
    if (!workspace) return null;

    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.public_url, publicUrl),
        eq(documents.workspace_id, workspace.id),
        eq(documents.is_public, true)
      ),
    });

    return doc;
  } catch (error) {
    console.error("Failed to get public document:", error);
    return null;
  }
}

