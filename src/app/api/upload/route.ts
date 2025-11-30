import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema-files";
import { getSession } from "@/lib/get-session";
import { getCurrentWorkspace } from "@/actions/workspace";
import { eq, and, desc } from "drizzle-orm";
import { uploadFile } from "@/lib/storage/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await getCurrentWorkspace();
    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string | null;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename for Cloudinary
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || '';
    const fileName = `${timestamp}-${randomString}`;
    const publicId = `flazy/${workspace.id}/${folder}/${fileName}`;

    // Upload to Cloudinary
    let fileUrl: string;
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // Fallback: Store file info without Cloudinary (for development)
      // In production, you should configure Cloudinary
      console.warn("Cloudinary not configured. Using placeholder URL.");
      fileUrl = `placeholder://${file.name}`;
    } else {
      const uploadResult = await uploadFile(buffer, {
        folder: `flazy/${workspace.id}/${folder}`,
        publicId: publicId,
        resourceType: "auto",
      });

      if (!uploadResult.success || !uploadResult.url) {
        console.error("Cloudinary upload failed:", uploadResult.error);
        return NextResponse.json(
          { error: uploadResult.error || "Failed to upload file to Cloudinary", success: false },
          { status: 500 }
        );
      }
      
      fileUrl = uploadResult.url;
    }

    // Save file info to database
    const [savedFile] = await db.insert(files).values({
      workspace_id: workspace.id,
      client_id: clientId,
      uploaded_by: session.user.id,
      file_name: file.name,
      file_url: fileUrl,
      file_size: file.size,
      file_type: file.type || "application/octet-stream",
      folder: folder
    }).returning();

    return NextResponse.json({
      success: true,
      file: {
        id: savedFile.id,
        name: savedFile.file_name,
        url: savedFile.file_url,
        size: savedFile.file_size,
        type: savedFile.file_type
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    return NextResponse.json(
      { 
        error: errorMessage, 
        success: false,
        details: process.env.NODE_ENV === "development" ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await getCurrentWorkspace();
    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const folder = searchParams.get("folder");

    let conditions = [eq(files.workspace_id, workspace.id)];

    if (clientId) {
      conditions.push(eq(files.client_id, clientId));
    }

    if (folder) {
      conditions.push(eq(files.folder, folder));
    }

    const fileList = await db.select()
      .from(files)
      .where(and(...conditions))
      .orderBy(desc(files.created_at));

    return NextResponse.json({
      success: true,
      files: fileList
    });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { error: "Failed to get files" },
      { status: 500 }
    );
  }
}
