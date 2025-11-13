import { Droppable } from "@hello-pangea/dnd";
import { Project } from "@/db";
import ProjectCard from "./project-card";

const ProjectColumn = ({
  column,
  handleDeleteProject,
  getProjectPriorityColor,
}: {
  column: { value: string; label: string; projects: Project[] };
  handleDeleteProject: (e: React.MouseEvent<HTMLButtonElement>, projectId: string) => void;
  getProjectPriorityColor: (priority: string) => string;
}) => {
  return (
    <Droppable droppableId={column.value} key={column.value}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              {column.label}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
              {column.projects.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 max-h-full h-full overflow-auto">
            {column.projects.map((project, index) => (
              <ProjectCard
                key={`${column.value}-${project.id}-${index}`}
                project={project}
                index={index}
                handleDeleteProject={handleDeleteProject}
                getProjectPriorityColor={getProjectPriorityColor}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default ProjectColumn;