import { db } from "@/db";
import { ClientsTable } from "@/features/clients/clients-table";

export default async function ClientsPage() {
  const allClients = await db.query.clients.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt)
  });

  return <ClientsTable clients={allClients} />;
}

