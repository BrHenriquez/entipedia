"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db, projects } from "@/db";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/lib/utils";

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  status: z.enum(PROJECT_STATUSES.map((status) => status.value) as [typeof PROJECT_STATUSES[number]["value"], ...typeof PROJECT_STATUSES[number]["value"][]]),
  priority: z.enum(PROJECT_PRIORITIES.map((priority) => priority.value) as [typeof PROJECT_PRIORITIES[number]["value"], ...typeof PROJECT_PRIORITIES[number]["value"][]])
});

export async function createProjectAction(input: Omit<z.infer<typeof projectSchema>, "id">) {
  const parsed = projectSchema.omit({ id: true }).parse(input);

  await db.insert(projects).values({
    name: parsed.name,
    description: parsed.description,
    status: parsed.status,
    priority: parsed.priority
  });

  revalidatePath("/projects");
}

export async function updateProjectStatusAction(input: { id: string; status: string }) {
  const parsed = projectSchema.pick({ id: true, status: true }).parse({
    id: input.id,
    status: input.status
  });

  await db
    .update(projects)
    .set({
      status: parsed.status as typeof PROJECT_STATUSES[number]["value"],
      updatedAt: new Date()
    })
    .where(eq(projects.id, parsed.id ?? ""));

  revalidatePath("/projects");
}

export async function deleteProjectAction(id: string) {
  const parsed = projectSchema.pick({ id: true }).parse({ id });
  
  if (!parsed.id) {
    throw new Error("Project ID is required");
  }

  await db.delete(projects).where(eq(projects.id, parsed.id));

  revalidatePath("/projects");
}

export async function updateProjectAction(input: { id: string; name: string; description: string; priority: string }) {
  const parsed = projectSchema
    .pick({ id: true, name: true, description: true, priority: true })
    .parse(input);


  if (!parsed.id) {
    throw new Error("Project ID is required");
  }
  
  await db
    .update(projects)
    .set({
      name: parsed.name,
      description: parsed.description,
      priority: parsed.priority,
      updatedAt: new Date()
    })
    .where(eq(projects.id, parsed.id));

  revalidatePath("/projects");
}

