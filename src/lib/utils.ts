export const PROJECT_STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "in-progress", label: "In progress" },
    { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" }
] as const;

export const PROJECT_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-100" },
  { value: "medium", label: "Medium", color: "bg-blue-100" },
  { value: "high", label: "High", color: "bg-yellow-100" },
  { value: "critical", label: "Critical", color: "bg-red-100" }
] as const;

export const CLIENT_TYPES = [
  { value: "person", label: "Person" },
  { value: "company", label: "Company" }
] as const;

export function getStatusLabel(value: string) {
  return PROJECT_STATUSES.find((status) => status.value === value)?.label ?? value;
}

export function getPriorityLabel(value: string) {
  return PROJECT_PRIORITIES.find((priority) => priority.value === value)?.label ?? value;
}

export const PROJECT_STATUS_COLORS = [
  { value: "backlog", label: "Backlog", color: "bg-slate-100" },
  { value: "in-progress", label: "In progress", color: "bg-blue-100" },
  { value: "review", label: "Review", color: "bg-yellow-100" },
  { value: "completed", label: "Completed", color: "bg-green-100" },
  { value: "archived", label: "Archived", color: "bg-gray-100" }
] as const;

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(d);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium"
  }).format(d);
}

export function formatCurrencyDOP(value: number | string) {
  const numeric = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numeric)) return "RD$ 0.00";

  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP"
  }).format(numeric);
}

export function parseCurrencyInput(value: string) {
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const toDateInputValue = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

