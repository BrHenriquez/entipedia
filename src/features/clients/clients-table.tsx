"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { CLIENT_TYPES, toDateInputValue } from "@/lib/utils";
import {
  deleteClientAction,
  updateClientFieldAction
} from "@/app/clients/actions";
import type { Client } from "@/db";
import CreateClientDialog from "./create-client";
import ClientRow from "./client-row";

const PAGE_SIZE = 10;

type ClientsTableProps = {
  clients: Client[];
};

export type EditableField = "name" | "type" | "value" | "startDate" | "endDate";

export function ClientsTable({ clients }: ClientsTableProps) {
  const [rows, setRows] = useState(clients);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
  const [draftValue, setDraftValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(clients);
  }, [clients]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const beginEdit = (id: string, field: EditableField) => {
    const client = rows.find((row) => row.id === id);
    if (!client) return;

    let value = "";
    switch (field) {
      case "name":
        value = client.name ?? "";
        break;
      case "type":
        value = client.type ?? CLIENT_TYPES[0].value;
        break;
      case "value":
        value = client.value?.toString() ?? "0";
        break;
      case "startDate":
        value = client.startDate ? toDateInputValue(client.startDate) : "";
        break;
      case "endDate":
        value = client.endDate ? toDateInputValue(client.endDate) : "";
        break;
      default:
        break;
    }

    setEditingCell({ id, field });
    setDraftValue(value);
  };

  const saveEdit = useCallback((id: string, field: EditableField) => {
    startTransition(async () => {
      try {
        let value: unknown = draftValue;
        let nextValueForState: unknown = draftValue;
        if (field === "value") {
          const numeric = Number.parseFloat(draftValue);
          if (Number.isNaN(numeric)) {
            throw new Error("Value must be numeric.");
          }
          value = numeric;
          nextValueForState = numeric.toString();
        }
        if (field === "startDate" && draftValue === "") {
          throw new Error("Start date cannot be empty.");
        }
        if (field === "startDate" || field === "endDate") {
          const dateValue = draftValue ? new Date(draftValue) : null;
          value = dateValue;
          nextValueForState = dateValue;
        }

        const updatedRows = rows.map((row) => {
          if (row.id !== id) return row;
          if (field === "name") return { ...row, name: nextValueForState as string };
          if (field === "type") return { ...row, type: nextValueForState as string };
          if (field === "value") return { ...row, value: nextValueForState as string };
          if (field === "startDate") return { ...row, startDate: nextValueForState as Date | null };
          if (field === "endDate") return { ...row, endDate: nextValueForState as Date | null | undefined };
          return row;
        })

        setRows(updatedRows as Client[]);

        await updateClientFieldAction({ id, field, value });
        setEditingCell(null);
      } catch (error) {
        console.error(error);
      }
    });
  }, [draftValue, startTransition, rows]);

  const cancelEdit = () => {
    setEditingCell(null);
    setDraftValue("");
  };

  const deleteClient = (client: Client) => {
    startTransition(async () => {
      setRows((previous) => previous.filter((row) => row.id !== client.id));
      await deleteClientAction(client.id);
    })
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500">Manage the client portfolio of Entipedia.</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-gold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2"
        >
          New client
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value (DOP)</th>
              <th className="px-4 py-3">Start date</th>
              <th className="px-4 py-3">End date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.map((client) => {
              const isEditing = (field: EditableField) =>
                editingCell?.id === client.id && editingCell.field === field;

              return (
                <ClientRow
                  key={client.id}
                  client={client}
                  isEditing={isEditing}
                  beginEdit={(id: string, field: EditableField) => beginEdit(id, field)}
                  cancelEdit={cancelEdit}
                  saveEdit={(id: string, field: EditableField) => saveEdit(id, field)}
                  draftValue={draftValue}
                  setDraftValue={setDraftValue}
                  onDeleteClient={() => deleteClient(client)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {isDialogOpen ? (
        <CreateClientDialog onClose={() => setIsDialogOpen(false)} isPending={isPending} />
      ) : null}
    </div>
  );
}
