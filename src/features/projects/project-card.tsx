import { getPriorityLabel, formatDateTime } from "@/lib/utils";
import { Draggable } from "@hello-pangea/dnd";
import { Project } from "@/db";
import Image from "next/image";

const ProjectCard = ({
  project,
  handleDeleteProject,
  getProjectPriorityColor,
  index,
}: {
  project: Project;
  handleDeleteProject: (e: React.MouseEvent<HTMLButtonElement>, projectId: string) => void;
  getProjectPriorityColor: (priority: string) => string;
  index: number;
}) => {
  return (
    <Draggable draggableId={project.id} index={index} key={project.id}>
      {(draggableProvided, snapshot) => (
        <article
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
          {...draggableProvided.dragHandleProps}
          className={`group rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm transition-shadow ${snapshot.isDragging ? "ring-2 ring-brand" : ""
            }`}
        >
          <div className="flex items-start gap-1 flex-col">
            <div className="flex items-center gap-2 flex-row justify-between w-full">
              <h3 className="text-base font-semibold text-slate-900 flex-1">
                {project.name}
              </h3>
              <button
                id={`delete-project-${project.id}`}
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-md border border-transparent px-2 py-1 border-red-500 bg-red-500"
                onClick={(e) => handleDeleteProject(e, project.id)}>
                <Image
                  src="/images/delete-icon.svg"
                  alt="Delete"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            <p className="mt-1 max-h-24 overflow-hidden text-sm text-slate-500">
              {project.description}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-row justify-between w-full">
              <span className={`rounded-full ${getProjectPriorityColor(project.priority)} px-2 py-1 font-medium`}>
                {getPriorityLabel(project.priority)}
              </span>
            </div>
            <span>{formatDateTime(project.createdAt)}</span>
          </div>
        </article>
      )}
    </Draggable>
  );
};

export default ProjectCard;