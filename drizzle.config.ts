import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables from .env.local (development) or system env (production)
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default defineConfig({
  schema: [
    "./src/lib/db/schema.ts",
    "./src/lib/db/schema-bookings.ts",
    "./src/lib/db/schema-proposals.ts",
    "./src/lib/db/schema-files.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
