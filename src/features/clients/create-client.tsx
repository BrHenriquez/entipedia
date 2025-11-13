import { createClientAction } from "@/app/clients/actions";
import { CLIENT_TYPES, toDateInputValue } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";


const createClientSchema = z.object({
  name: z.string().min(2),
  type: z.enum(CLIENT_TYPES.map((type) => type.value) as [typeof CLIENT_TYPES[number]["value"], ...typeof CLIENT_TYPES[number]["value"][]]),
  value: z.coerce.number().min(0),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable()
});

type CreateClientInput = z.infer<typeof createClientSchema>;

type CreateClientDialogProps = {
  onClose: () => void;
  isPending: boolean;
};

const CreateClientDialog = ({ onClose, isPending }: CreateClientDialogProps) => {
  const [isSaving, startTransition] = useTransition();
  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      type: CLIENT_TYPES[0].value,
      value: 0,
      startDate: toDateInputValue(new Date()),
      endDate: undefined
    }
  });

  const pending = isPending || isSaving;

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        await createClientAction({
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : undefined
        });
        form.reset();
        onClose();
      } catch (error) {
        console.error(error);
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Register client</h2>
            <p className="text-sm text-slate-500">
              Register a new client with the main data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-transparent px-2 py-1 text-sm text-slate-500 hover:border-slate-200 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Name
              </label>
              <input
                {...form.register("name")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Type
              </label>
              <select
                {...form.register("type")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {CLIENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Value (DOP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...form.register("value", { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              {form.formState.errors.value ? (
                <p className="text-xs text-red-500">{form.formState.errors.value.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Start date
              </label>
              <input
                type="date"
                {...form.register("startDate")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                End date
              </label>
              <input
                type="date"
                {...form.register("endDate")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-gold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2"
            >
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClientDialog;