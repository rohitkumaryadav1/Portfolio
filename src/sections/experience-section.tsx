import { Reveal } from '@/components/reveal';
import type { Row } from '@/lib/content';
const date = (v: string) =>
  v
    ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Present';
export function ExperienceSection({ experiences }: { experiences: Row<'experiences'>[] }) {
  return (
    <section id="experience" className="section wrap">
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / LEARNING IN PRACTICE</span>
          <h2>
            Experience that <em>shapes me.</em>
          </h2>
        </div>
      </div>
      <div className="timeline">
        {experiences.map((r) => (
          <Reveal key={r.id}>
            <article className="experience">
              <div className="experience-date">
                {date(r.data.start_date)} — {date(r.data.completion_date)}
                <span>{r.data.location}</span>
              </div>
              <div>
                <span className="eyebrow">PROFESSIONAL EXPERIENCE</span>
                <h3>{r.data.position}</h3>
                <h4>{r.data.organization}</h4>
                {r.data.parent_organization && (
                  <p className="small">{r.data.parent_organization}</p>
                )}
                <p>{r.data.description}</p>
                <ul>
                  {r.data.responsibilities.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
                {r.data.achievements.length > 0 && (
                  <div className="achievement">
                    <span className="eyebrow">SELECTED OUTCOMES</span>
                    {r.data.achievements.map((v) => (
                      <p key={v}>{v}</p>
                    ))}
                  </div>
                )}
                <div className="tags">
                  {r.data.technologies.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
