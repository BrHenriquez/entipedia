import { db } from "@/db";
import { ProjectsBoard } from "@/features/projects/projects-board";

// Force dynamic rendering since this page depends on database data
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const allProjects = await db.query.projects.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt)
  });

  return <ProjectsBoard projects={allProjects} />;
}

