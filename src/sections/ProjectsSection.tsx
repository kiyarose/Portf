import { SectionContainer } from '../components/SectionContainer'
import { SectionHeader } from '../components/SectionHeader'
import { ProjectCard } from '../components/ProjectCard'
import { projects } from '../data/projects'

export function ProjectsSection() {
  return (
    <SectionContainer id="projects" className="pb-20">
      <div className="card-surface space-y-8">
        <SectionHeader
          id="projects"
          icon="material-symbols:rocket-launch-rounded"
          label="Projects"
          eyebrow="Case Studies"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
