import { db } from "../lib/db";
import { conversations, client_spaces, workspaces } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

async function createMissingConversations() {
    try {
        console.log("Checking for missing conversations...");
        
        // Get all workspaces (or you can specify workspace_id directly)
        const allWorkspaces = await db.select().from(workspaces).limit(10);
        
        if (allWorkspaces.length === 0) {
            console.error("No workspaces found");
            process.exit(1);
        }

        console.log(`Found ${allWorkspaces.length} workspace(s)`);

        for (const workspace of allWorkspaces) {
            console.log(`\nProcessing workspace: ${workspace.id} (${workspace.name})`);
            
            // Get all client spaces for this workspace
            const allSpaces = await db.select()
                .from(client_spaces)
                .where(eq(client_spaces.workspace_id, workspace.id));

            console.log(`Found ${allSpaces.length} client spaces in this workspace`);

            let created = 0;
            let skipped = 0;

            for (const space of allSpaces) {
                // Check if external conversation already exists
                const existingExternal = await db.select()
                    .from(conversations)
                    .where(and(
                        eq(conversations.client_space_id, space.id),
                        eq(conversations.workspace_id, workspace.id),
                        eq(conversations.chat_type, "client_external")
                    ))
                    .limit(1);

                if (existingExternal.length === 0) {
                    // Create external conversation
                    await db.insert(conversations).values({
                        workspace_id: workspace.id,
                        client_space_id: space.id,
                        chat_type: "client_external",
                        title: "General Chat"
                    });
                    console.log(`  ✓ Created external conversation for client space ${space.id}`);
                    created++;
                } else {
                    console.log(`  - External conversation already exists for client space ${space.id}`);
                    skipped++;
                }

                // Check if internal conversation already exists
                const existingInternal = await db.select()
                    .from(conversations)
                    .where(and(
                        eq(conversations.client_space_id, space.id),
                        eq(conversations.workspace_id, workspace.id),
                        eq(conversations.chat_type, "client_internal")
                    ))
                    .limit(1);

                if (existingInternal.length === 0) {
                    // Create internal conversation
                    await db.insert(conversations).values({
                        workspace_id: workspace.id,
                        client_space_id: space.id,
                        chat_type: "client_internal",
                        title: "Internal Chat"
                    });
                    console.log(`  ✓ Created internal conversation for client space ${space.id}`);
                    created++;
                } else {
                    console.log(`  - Internal conversation already exists for client space ${space.id}`);
                    skipped++;
                }
            }

            console.log(`\n✅ Workspace ${workspace.name}: Created ${created} conversations, skipped ${skipped} existing ones`);
        }

        console.log(`\n✅ All done!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating conversations:", error);
        process.exit(1);
    }
}

createMissingConversations();

