// Seed script - loads environment variables before importing database module
import { config } from "dotenv";
import { resolve } from "path";

async function main() {
  // Load .env file synchronously
  const envPath = resolve(process.cwd(), ".env");
  const result = config({ path: envPath });

  if (result.error) {
    console.warn(`⚠️  Warning: ${result.error.message}`);
  }

  // Verify DATABASE_URL is loaded
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL environment variable is not set.");
    console.error(`   Tried to load from: ${envPath}`);
    console.error("   Please ensure DATABASE_URL is set in your .env file.");
    process.exit(1);
  }

  console.log(`✅ Loaded DATABASE_URL from ${envPath}`);

  // Dynamically import db module AFTER env vars are loaded
  // This prevents hoisting issues where imports execute before env vars load
  const { db, pool, clients, projects, files } = await import("../src/db/index.js");

  // Helper function to generate random file size in bytes
  function randomFileSize(minMB: number, maxMB: number): string {
    const sizeInBytes = Math.floor(
      Math.random() * (maxMB - minMB) * 1024 * 1024 + minMB * 1024 * 1024
    );
    return sizeInBytes.toString();
  }

  async function seed() {
    console.log("🌱 Starting database seed...");

    try {
      // Clear existing data
      console.log("🧹 Clearing existing data...");
      await db.delete(files);
      await db.delete(projects);
      await db.delete(clients);
      console.log("✅ Existing data cleared");

      // Seed Clients
      console.log("👥 Seeding clients...");
      const clientData = [
        {
          name: "Acme Corporation",
          type: "company" as const,
          value: "125000.00",
          startDate: new Date("2023-01-15"),
          endDate: new Date("2024-12-31"),
          active: true,
        },
        {
          name: "TechStart Inc",
          type: "company" as const,
          value: "85000.50",
          startDate: new Date("2023-03-20"),
          endDate: new Date("2025-06-30"),
          active: true,
        },
        {
          name: "Juan Perez",
          type: "person" as const,
          value: "25000.00",
          startDate: new Date("2023-05-10"),
          endDate: null,
          active: true,
        },
        {
          name: "Maria Gonzalez",
          type: "person" as const,
          value: "15000.75",
          startDate: new Date("2023-07-01"),
          endDate: new Date("2024-12-31"),
          active: true,
        },
        {
          name: "Global Solutions Ltd",
          type: "company" as const,
          value: "200000.00",
          startDate: new Date("2022-11-01"),
          endDate: new Date("2025-12-31"),
          active: true,
        },
        {
          name: "Carlos Rodriguez",
          type: "person" as const,
          value: "18000.25",
          startDate: new Date("2023-09-15"),
          endDate: null,
          active: false,
        },
        {
          name: "Innovation Labs Inc",
          type: "company" as const,
          value: "95000.00",
          startDate: new Date("2023-06-01"),
          endDate: new Date("2024-06-30"),
          active: true,
        },
        {
          name: "Ana Martinez",
          type: "person" as const,
          value: "32000.50",
          startDate: new Date("2023-04-05"),
          endDate: null,
          active: true,
        },
      ];

      const insertedClients = await db.insert(clients).values(clientData as unknown as typeof clients.$inferInsert[]).returning();
      console.log(`✅ Inserted ${insertedClients.length} clients`);

      // Seed Projects
      console.log("📋 Seeding projects...");
      const projectData = [
        {
          name: "ERP System",
          description:
            "Development of a complete enterprise management system with modules for inventory, billing and human resources.",
          status: "in-progress" as const,
          priority: "high" as const,
        },
        {
          name: "Mobile Commerce App",
          description:
            "Mobile application for iOS and Android that allows users to buy products directly from their phones.",
          status: "backlog" as const,
          priority: "medium" as const,
        },
        {
          name: "E-learning Platform",
          description:
            "Online learning system with interactive courses, evaluations and certifications.",
          status: "review" as const,
          priority: "high" as const,
        },
        {
          name: "Corporate Website",
          description:
            "Complete redesign of the corporate website with improvements in UX/UI and SEO optimization.",
            status: "completed" as const,
          priority: "low" as const,
        },
        {
          name: "Integration API",
          description:
            "Development of a RESTful API to integrate external systems with our main platform.",
          status: "in-progress" as const,
          priority: "critical" as const,
        },
        {
          name: "Analytical Dashboard",
          description:
            "Control panel with real-time data visualizations and metrics for decision-making.",
          status: "backlog" as const,
          priority: "medium" as const,
        },
        {
          name: "Authentication System",
          description:
            "Implementation of a secure authentication system with OAuth 2.0 and multi-factor authentication.",
          status: "in-progress" as const,
          priority: "high" as const,
        },
        {
          name: "Database Migration",
          description:
            "Migration of legacy database to a new architecture with better performance and scalability.",
          status: "review" as const,
          priority: "critical" as const,
        },
        {
          name: "Client Portal",
          description:
            "Web portal where clients can manage their orders, invoices and communicate with support.",
          status: "backlog" as const,
          priority: "low" as const,
        },
        {
          name: "Process Automation",
          description:
            "Implementation of bots and automation for repetitive processes and increase in efficiency.",
          status: "archived" as const,
          priority: "medium" as const,
        },
        {
          name: "Reporting System",
          description:
            "Automatic generation of financial, operational and human resources reports.",
          status: "completed" as const,
          priority: "medium" as const,
        },
        {
          name: "Real-time Chat Application",
          description:
            "Instant messaging system for internal communication and with clients.",
          status: "backlog" as const,
          priority: "low" as const,
        },
      ];

      const insertedProjects = await db.insert(projects).values(projectData as unknown as typeof projects.$inferInsert[]).returning();
      console.log(`✅ Inserted ${insertedProjects.length} projects`);

      // Seed Files
      console.log("📁 Seeding files...");
      const fileData = [
        {
          name: "final-design.pdf",
          description: "Final project design",
          mimeType: "application/pdf",
          extension: "pdf",
          size: randomFileSize(2, 10),
          s3Key: "files/designs/final-design.pdf",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/designs/final-design.pdf",
        },
        {
          name: "client-presentation.pptx",
          description: "Presentation for meeting with clients",
          mimeType:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          extension: "pptx",
          size: randomFileSize(5, 20),
          s3Key: "files/presentations/client-presentation.pptx",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/presentations/client-presentation.pptx",
        },
        {
          name: "standard-contract-template.docx",
          description: "Standard contract template",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          extension: "docx",
          size: randomFileSize(1, 5),
          s3Key: "files/contracts/standard-contract-template.docx",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/contracts/standard-contract-template.docx",
        },
        {
          name: "company-logo.png",
          description: "Official company logo",
          mimeType: "image/png",
          extension: "png",
          size: randomFileSize(0.1, 2),
          s3Key: "files/images/company-logo.png",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/images/company-logo.png",
        },
        {
          name: "client-database.xlsx",
          description: "Client database",
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          extension: "xlsx",
          size: randomFileSize(1, 10),
          s3Key: "files/data/client-database.xlsx",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/data/client-database.xlsx",
        },
        {
          name: "user-manual.pdf",
          description: "User manual for the system",
          mimeType: "application/pdf",
          extension: "pdf",
          size: randomFileSize(3, 15),
          s3Key: "files/manuals/user-manual.pdf",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/manuals/user-manual.pdf",
        },
        {
          name: "architecture-diagram.jpg",
          description: "Architecture diagram for the system",
          mimeType: "image/jpeg",
          extension: "jpg",
          size: randomFileSize(0.5, 5),
          s3Key: "files/diagrams/architecture-diagram.jpg",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/diagrams/architecture-diagram.jpg",
        },
        {
          name: "backup-database.sql",
          description: "Database backup",
          mimeType: "application/sql",
          extension: "sql",
          size: randomFileSize(10, 100),
          s3Key: "files/backups/backup-database.sql",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/backups/backup-database.sql",
        },
        {
          name: "video-demo.mp4",
          description: "Product demo video",
          mimeType: "video/mp4",
          extension: "mp4",
          size: randomFileSize(50, 200),
          s3Key: "files/videos/video-demo.mp4",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/videos/video-demo.mp4",
        },
        {
          name: "technical-specifications.pdf",
          description: "Technical specifications document",
          mimeType: "application/pdf",
          extension: "pdf",
          size: randomFileSize(2, 8),
          s3Key: "files/specs/technical-specifications.pdf",
          s3Bucket: "entipedia-files",
          url: "https://entipedia-files.s3.amazonaws.com/files/specs/technical-specifications.pdf",
        },
      ];

      const insertedFiles = await db.insert(files).values(fileData as typeof files.$inferInsert[]).returning();
      console.log(`✅ Inserted ${insertedFiles.length} files`);

      console.log("\n🎉 Database seed completed successfully!");
      console.log(`\nSummary:`);
      console.log(`  - Clients: ${insertedClients.length}`);
      console.log(`  - Projects: ${insertedProjects.length}`);
      console.log(`  - Files: ${insertedFiles.length}`);
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw error;
    }
  }

  // Run the seed function
  await seed();

  console.log("\n🔌 Closing database connection...");
  await pool.end();
  console.log("✅ Database connection closed");
}

// Run main function and handle errors
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
