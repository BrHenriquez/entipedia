/**
 * Script to create PostgreSQL database and user
 * 
 * This script:
 * 1. Reads DATABASE_URL from .env file
 * 2. Parses the connection string to extract user, password, host, port, and database name
 * 3. Connects to PostgreSQL as an admin user (using ADMIN_DATABASE_URL or default 'postgres' user)
 * 4. Creates the database user if it doesn't exist
 * 5. Creates the database if it doesn't exist
 * 6. Grants necessary privileges
 * 
 * Usage:
 *   npm run db:create
 * 
 * Environment Variables:
 *   - DATABASE_URL: The target database connection string (required)
 *   - ADMIN_DATABASE_URL: Admin connection string for creating database/user (optional)
 *                         If not set, will try to use 'postgres' user with same password
 * 
 * Example .env:
 *   DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase
 *   ADMIN_DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/postgres
 */
import { config } from "dotenv";
import { resolve } from "path";
import { Client } from "pg";

interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

function parseDatabaseUrl(url: string): DatabaseConfig {
  try {
    // Use URL constructor for proper parsing (handles URL encoding)
    const dbUrl = new URL(url);
    
    if (dbUrl.protocol !== "postgresql:" && dbUrl.protocol !== "postgres:") {
      throw new Error("Invalid protocol. Expected postgresql:// or postgres://");
    }

    const user = decodeURIComponent(dbUrl.username);
    const password = decodeURIComponent(dbUrl.password);
    const host = dbUrl.hostname;
    const port = dbUrl.port ? parseInt(dbUrl.port, 10) : 5432;
    // Remove leading slash from pathname
    const database = dbUrl.pathname.slice(1);

    if (!user || !password || !host || !database) {
      throw new Error("Missing required components in DATABASE_URL (user, password, host, or database)");
    }

    return {
      user,
      password,
      host,
      port,
      database,
    };
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid DATABASE_URL format: ${error.message}. Expected: postgresql://user:password@host:port/database`);
    }
    throw new Error(`Failed to parse DATABASE_URL: ${error.message}`);
  }
}

async function createDatabase() {
  // Load environment variables
  const envPath = resolve(process.cwd(), ".env");
  const result = config({ path: envPath });

  if (result.error) {
    console.warn(`⚠️  Warning: ${result.error.message}`);
  }

  // Get DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL environment variable is not set.");
    console.error(`   Tried to load from: ${envPath}`);
    console.error("   Please ensure DATABASE_URL is set in your .env file.");
    process.exit(1);
  }

  console.log("📋 Parsing DATABASE_URL...");
  const dbConfig = parseDatabaseUrl(databaseUrl);

  // Get admin connection URL (for creating database and user)
  // Use ADMIN_DATABASE_URL if provided, otherwise try to connect as 'postgres' user
  // If ADMIN_DATABASE_URL is not set, we'll try connecting as 'postgres' user with the same password
  // You can also set ADMIN_DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/postgres
  let adminUrl = process.env.ADMIN_DATABASE_URL;
  
  if (!adminUrl) {
    // Try to use postgres user with the same password from DATABASE_URL
    // This works if your postgres user has the same password
    adminUrl = `postgresql://postgres:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/postgres`;
    console.log("ℹ️  ADMIN_DATABASE_URL not set, trying to connect as 'postgres' user");
    console.log("   If this fails, set ADMIN_DATABASE_URL in your .env file\n");
  }

  console.log(`\n📊 Database Configuration:`);
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Admin URL: ${adminUrl.replace(/:[^:@]+@/, ":****@")}\n`);

  // Connect as admin to create database and user
  const adminClient = new Client({ connectionString: adminUrl });

  try {
    console.log("🔌 Connecting to PostgreSQL as admin...");
    await adminClient.connect();
    console.log("✅ Connected to PostgreSQL\n");

    // Check if user exists, create if not
    console.log(`👤 Checking if user '${dbConfig.user}' exists...`);
    const userCheck = await adminClient.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [dbConfig.user]
    );

    if (userCheck.rows.length === 0) {
      console.log(`📝 Creating user '${dbConfig.user}'...`);
      // Escape user identifier and password safely for SQL
      // PostgreSQL requires literal strings for CREATE USER, not parameterized queries
      const escapedUser = `"${dbConfig.user.replace(/"/g, '""')}"`;
      // Escape single quotes in password by doubling them
      const escapedPassword = dbConfig.password.replace(/'/g, "''");
      await adminClient.query(
        `CREATE USER ${escapedUser} WITH PASSWORD '${escapedPassword}'`
      );
      console.log(`✅ User '${dbConfig.user}' created successfully\n`);
    } else {
      console.log(`✅ User '${dbConfig.user}' already exists\n`);
      
      // Update password if user exists (in case it changed)
      console.log(`🔐 Updating password for user '${dbConfig.user}'...`);
      try {
        const escapedUser = `"${dbConfig.user.replace(/"/g, '""')}"`;
        // Escape single quotes in password by doubling them
        const escapedPassword = dbConfig.password.replace(/'/g, "''");
        await adminClient.query(
          `ALTER USER ${escapedUser} WITH PASSWORD '${escapedPassword}'`
        );
        console.log(`✅ Password updated for user '${dbConfig.user}'\n`);
      } catch (error: any) {
        console.warn(`⚠️  Could not update password (this is okay if you don't have permissions): ${error.message}\n`);
      }
    }

    // Check if database exists, create if not
    console.log(`📦 Checking if database '${dbConfig.database}' exists...`);
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`📝 Creating database '${dbConfig.database}'...`);
      // Escape identifiers safely
      const escapedDb = `"${dbConfig.database.replace(/"/g, '""')}"`;
      const escapedUser = `"${dbConfig.user.replace(/"/g, '""')}"`;
      await adminClient.query(
        `CREATE DATABASE ${escapedDb} OWNER ${escapedUser}`
      );
      console.log(`✅ Database '${dbConfig.database}' created successfully\n`);
    } else {
      console.log(`✅ Database '${dbConfig.database}' already exists\n`);
      
      // Update owner if database exists but owner is different
      console.log(`🔄 Ensuring database ownership...`);
      try {
        const escapedDb = `"${dbConfig.database.replace(/"/g, '""')}"`;
        const escapedUser = `"${dbConfig.user.replace(/"/g, '""')}"`;
        await adminClient.query(
          `ALTER DATABASE ${escapedDb} OWNER TO ${escapedUser}`
        );
        console.log(`✅ Database ownership confirmed\n`);
      } catch (error) {
        console.warn(`⚠️  Could not update ownership (this is okay): ${error}\n`);
      }
    }

    // Grant privileges
    console.log(`🔐 Granting privileges to user '${dbConfig.user}'...`);
    try {
      const escapedDb = `"${dbConfig.database.replace(/"/g, '""')}"`;
      const escapedUser = `"${dbConfig.user.replace(/"/g, '""')}"`;
      await adminClient.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${escapedDb} TO ${escapedUser}`
      );
      console.log(`✅ Privileges granted successfully\n`);
    } catch (error) {
      console.warn(`⚠️  Could not grant privileges (this is okay if already granted): ${error}\n`);
    }

    console.log("🎉 Database setup completed successfully!");
    console.log(`\n✅ You can now use DATABASE_URL: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Run: npm run db:push (to create tables)`);
    console.log(`   2. Run: npm run db:seed (to seed data)`);
  } catch (error: any) {
    console.error("\n❌ Error creating database:", error.message);
    
    if (error.code === "28P01") {
      console.error("\n💡 Authentication failed. Please do one of the following:");
      console.error("\n   1. Set ADMIN_DATABASE_URL in your .env file:");
      console.error("      ADMIN_DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/postgres");
      console.error("\n   2. Or ensure the 'postgres' user password matches the password in your DATABASE_URL");
      console.error("\n   3. Or create the user and database manually using psql:");
      console.error(`      psql -U postgres -c "CREATE USER ${dbConfig.user} WITH PASSWORD '${dbConfig.password}';"`);
      console.error(`      psql -U postgres -c "CREATE DATABASE ${dbConfig.database} OWNER ${dbConfig.user};"`);
    } else if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Connection refused. Please ensure:");
      console.error("   1. PostgreSQL is running");
      console.error("   2. Host and port are correct in your DATABASE_URL");
      console.error("   3. PostgreSQL is listening on the specified host and port");
    } else if (error.message.includes("password authentication failed")) {
      console.error("\n💡 Password authentication failed. Please:");
      console.error("   1. Set ADMIN_DATABASE_URL in your .env file with correct admin credentials");
      console.error("   2. Or verify your PostgreSQL admin user password");
    }
    
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

// Run the script
createDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

