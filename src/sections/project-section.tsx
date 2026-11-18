import { Reveal } from '@/components/reveal';
import { ProjectFeature } from '@/components/project-feature';
import type { Row } from '@/lib/content';
export function ProjectSection({
  projects,
  featuredOnly,
  githubProfile,
  currentProjectId,
}: {
  projects: Row<'projects'>[];
  featuredOnly: boolean;
  githubProfile: string;
  currentProjectId?: string;
}) {
  return (
    <section id="projects" className="section wrap">
      <Reveal>
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / SELECTED WORK</span>
            <h2>
              Ideas, put <em>to work.</em>
            </h2>
          </div>
          <p>
            Current builds and independent projects.
            <br />
            Open one for the story, details, and links.
          </p>
        </div>
      </Reveal>
      <div className="projects">
        {projects
          .filter((r) => !featuredOnly || r.data.featured || r.id === currentProjectId)
          .map((r) => (
            <Reveal key={r.id}>
              <ProjectFeature project={r} githubProfile={githubProfile} />
            </Reveal>
          ))}
      </div>
    </section>
  );
}
