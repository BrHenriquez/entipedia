import { db } from "@/db";
import { ClientsTable } from "@/features/clients/clients-table";

// Force dynamic rendering since this page depends on database data
export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const allClients = await db.query.clients.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt)
  });

  return <ClientsTable clients={allClients} />;
}

