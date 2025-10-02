import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { ProjectCard } from "../components/ProjectCard";
import {
  PROJECTS_RESOURCE,
  projectsFallback,
  projectsPlaceholder,
  type Project,
} from "../data/projects";
import { useRemoteData } from "../hooks/useRemoteData";

export function ProjectsSection() {
  const {
    data: projectEntries,
    debugAttributes: projectDebugAttributes,
  } = useRemoteData<Project[]>({
    resource: PROJECTS_RESOURCE,
    fallbackData: projectsFallback,
    placeholderData: projectsPlaceholder,
  });

  return (
    <SectionContainer
      id="projects"
      className="pb-20"
      debugAttributes={projectDebugAttributes}
    >
      <div className="card-surface space-y-8">
        <SectionHeader
          id="projects"
          icon="material-symbols:rocket-launch-rounded"
          label="Hobby Projects"
          eyebrow="Cool things I did!"
        />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {projectEntries.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
