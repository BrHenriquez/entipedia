"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/lib/utils";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectStatusAction
} from "@/app/projects/actions";
import type { Project } from "@/db";
import ProjectColumn from "./project-column";

type ProjectsBoardProps = {
  projects: Project[];
};

const createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  status: z.enum(PROJECT_STATUSES.map((status) => status.value) as [string, ...string[]]),
  priority: z.enum(PROJECT_PRIORITIES.map((priority) => priority.value) as [string, ...string[]])
});

const getProjectPriorityColor = (priority: string) => {
  if (priority === "low") return "bg-slate-100";
  if (priority === "medium") return "bg-blue-100";
  if (priority === "high") return "bg-yellow-100";
  if (priority === "critical") return "bg-red-100";
  return "bg-slate-100";
}

type CreateProjectInput = z.infer<typeof createProjectSchema>;

export function ProjectsBoard({ projects }: ProjectsBoardProps) {
  const [items, setItems] = useState(projects);
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setItems(projects);
  }, [projects]);

  const columns = useMemo(() => {
    return PROJECT_STATUSES.map((status) => ({
      ...status,
      projects: items.filter((item) => item.status === status.value)
    }));
  }, [items]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const projectId = draggableId;
    const newStatus = destination.droppableId;

    const updatedItems = items.map((project) =>
      project.id === projectId ? { ...project, status: newStatus } : project
    );

    setItems(updatedItems as Project[]);

    startTransition(async () => {
      try {
        await updateProjectStatusAction({ id: projectId, status: newStatus });
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleDeleteProject = async (e: React.MouseEvent<HTMLButtonElement>, projectId: string) => {
    try {
      e.stopPropagation();
      await deleteProjectAction(projectId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects board</h1>
          <p className="text-sm text-slate-500">
            Drag and drop to update the status of each project.
          </p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-gold shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2"
        >
          New project
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-1 md:grid-cols-2 xl:grid-cols-5 md:max-h-full h-full">
          {columns.map((column) => (
            <ProjectColumn
              key={column.value}
              column={column}
              handleDeleteProject={handleDeleteProject}
              getProjectPriorityColor={getProjectPriorityColor}
            />
          ))}
        </div>
      </DragDropContext>

      {isDialogOpen ? (
        <CreateProjectDialog
          onClose={() => setIsDialogOpen(false)}
          isPending={isPending}
        />
      ) : null}
    </div>
  );
}

type CreateProjectDialogProps = {
  onClose: () => void;
  isPending: boolean;
};

function CreateProjectDialog({ onClose, isPending }: CreateProjectDialogProps) {
  const [isSaving, startTransition] = useTransition();
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: PROJECT_STATUSES[0].value,
      priority: PROJECT_PRIORITIES[1].value
    }
  });

  const pending = isPending || isSaving;

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        await createProjectAction({
          name: data.name,
          description: data.description,
          status: data.status as typeof PROJECT_STATUSES[number]["value"],
          priority: data.priority as typeof PROJECT_PRIORITIES[number]["value"]
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
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create project</h2>
            <p className="text-sm text-slate-500">
              Complete the information to register a new project.
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
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Name
            </label>
            <input
              {...form.register("name")}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="New project Entipedia"
            />
            {form.formState.errors.name ? (
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              {...form.register("description")}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="Describe the scope and objectives of the project."
            />
            {form.formState.errors.description ? (
              <p className="mt-1 text-xs text-red-500">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </label>
              <select
                {...form.register("status")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Priority
              </label>
              <select
                {...form.register("priority")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {PROJECT_PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
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
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-gold shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

