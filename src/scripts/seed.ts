import { db } from "@/lib/db";
import { 
  workspaces, 
  client_companies, 
  funnels, 
  funnel_steps, 
  boards, 
  board_columns 
} from "@/lib/db/schema";

async function seed() {
  console.log("🌱 Starting seed...");
  
  // Check if default workspace exists
  const existingWorkspace = await db.query.workspaces.findFirst({
    where: (workspaces, { eq }) => eq(workspaces.id, "demo-workspace-001")
  });

  if (!existingWorkspace) {
    console.log("Creating demo workspace...");
    
    // Create demo workspace
    await db.insert(workspaces).values({
      id: "demo-workspace-001",
      name: "Demo Workspace",
      billing_email: "demo@onboardhub.com",
      subscription_tier: "professional",
      subscription_status: "active"
    });

    // Create sample clients
    console.log("Creating sample clients...");
    const clients = await db.insert(client_companies).values([
      {
        workspace_id: "demo-workspace-001",
        name: "John Smith",
        email: "john@techcorp.com",
        company_name: "TechCorp Inc.",
        category: "Technology",
        status: "active",
        description: "Enterprise software solutions"
      },
      {
        workspace_id: "demo-workspace-001",
        name: "Sarah Johnson",
        email: "sarah@designstudio.com",
        company_name: "Design Studio Pro",
        category: "Design",
        status: "active",
        description: "Creative design agency"
      },
      {
        workspace_id: "demo-workspace-001",
        name: "Mike Chen",
        email: "mike@marketingco.com",
        company_name: "Marketing Co",
        category: "Marketing",
        status: "onboarding",
        description: "Digital marketing experts"
      }
    ]).returning();

    // Create sample funnel
    console.log("Creating sample funnel...");
    const [funnel] = await db.insert(funnels).values({
      workspace_id: "demo-workspace-001",
      name: "Standard Onboarding",
      description: "Default client onboarding flow",
      public_url: "standard-onboarding",
      published: true
    }).returning();

    // Add funnel steps
    await db.insert(funnel_steps).values([
      {
        funnel_id: funnel.id,
        step_type: "form",
        order: 0,
        config: {
          title: "Project Information",
          fields: [
            { id: "company", name: "Company Name", type: "text", required: true },
            { id: "budget", name: "Project Budget", type: "text", required: true },
            { id: "timeline", name: "Timeline", type: "text", required: true },
            { id: "requirements", name: "Requirements", type: "textarea", required: false }
          ]
        }
      },
      {
        funnel_id: funnel.id,
        step_type: "contract",
        order: 1,
        config: {
          title: "Service Agreement",
          content: "This is a standard service agreement...",
          requireSignature: true
        }
      },
      {
        funnel_id: funnel.id,
        step_type: "invoice",
        order: 2,
        config: {
          title: "Initial Payment",
          amount: 5000,
          currency: "USD"
        }
      }
    ]);

    // Create default board
    console.log("Creating default board...");
    const [board] = await db.insert(boards).values({
      workspace_id: "demo-workspace-001",
      name: "Sales Pipeline",
      board_type: "sales"
    }).returning();

    // Add columns
    await db.insert(board_columns).values([
      { board_id: board.id, name: "Leads", order: 0 },
      { board_id: board.id, name: "Contacted", order: 1 },
      { board_id: board.id, name: "Proposal Sent", order: 2 },
      { board_id: board.id, name: "Negotiation", order: 3 },
      { board_id: board.id, name: "Closed", order: 4 }
    ]);

    console.log("✅ Seed completed!");
  } else {
    console.log("Demo workspace already exists, skipping...");
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
