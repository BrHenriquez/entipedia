import { db } from "@/db";
import { ProjectsBoard } from "@/features/projects/projects-board";

export default async function ProjectsPage() {
  const allProjects = await db.query.projects.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt)
  });

  return <ProjectsBoard projects={allProjects} />;
}

