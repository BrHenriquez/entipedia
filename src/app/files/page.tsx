import { db } from "@/db";
import { FilesManager } from "@/features/files/files-manager";

// Force dynamic rendering since this page depends on database data
export const dynamic = 'force-dynamic';

export default async function FilesPage() {
  const allFiles = await db.query.files.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt)
  });

  return <FilesManager files={allFiles} />;
}

