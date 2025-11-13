"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { clients, db } from "@/db";
import { CLIENT_TYPES } from "@/lib/utils";

const clientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "name is required."),
  type: z.enum(CLIENT_TYPES.map((type) => type.value) as [typeof CLIENT_TYPES[number]["value"], ...typeof CLIENT_TYPES[number]["value"][]]),
  value: z.coerce.number().min(0, "value must be positive."),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable()
});

const createClientInputSchema = clientSchema.omit({ id: true });
type CreateClientInput = z.input<typeof createClientInputSchema>;

export async function createClientAction(input: CreateClientInput) {
  const parsed = createClientInputSchema.parse(input);

  await db.insert(clients).values({
    name: parsed.name,
    type: parsed.type,
    value: parsed.value.toString(),
    startDate: parsed.startDate,
    endDate: parsed.endDate ?? null
  });

  revalidatePath("/clients");
}

const editableFields = ["name", "type", "value", "startDate", "endDate", "active"] as const;
type EditableField = (typeof editableFields)[number];

export async function updateClientFieldAction(input: { id: string; field: EditableField; value: unknown }) {
  const baseId = clientSchema.pick({ id: true }).parse({ id: input.id });

  let update: Partial<typeof clients.$inferInsert> = {};

  switch (input.field) {
    case "name": {
      const value = clientSchema.shape.name.parse(input.value);
      update = { name: value };
      break;
    }
    case "type": {
      const value = clientSchema.shape.type.parse(input.value);
      update = { type: value };
      break;
    }
    case "value": {
      const value = clientSchema.shape.value.parse(input.value);
      update = { value: value.toString() };
      break;
    }
    case "startDate": {
      const value = clientSchema.shape.startDate.parse(input.value);
      update = { startDate: value };
      break;
    }
    case "endDate": {
      const value = clientSchema.shape.endDate.parse(input.value);
      update = { endDate: value ?? null };
      break;
    }
    case "active": {
      const value = z.coerce.boolean().parse(input.value);
      update = { active: value };
      break;
    }
    default:
      throw new Error("Campo no editable");
  }

  await db
    .update(clients)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(clients.id, baseId.id ?? ""));

  revalidatePath("/clients");
}

export async function deleteClientAction(id: string) {
  const parsed = clientSchema.pick({ id: true }).parse({ id });

  await db.delete(clients).where(eq(clients.id, parsed.id ?? ""));

  revalidatePath("/clients");
}

