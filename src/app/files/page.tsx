import { db } from "@/db";
import { FilesManager } from "@/features/files/files-manager";

export default async function FilesPage() {
  const allFiles = await db.query.files.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt)
  });

  return <FilesManager files={allFiles} />;
}

