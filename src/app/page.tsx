import { ExperienceSection } from '@/sections/experience-section';
import { ProjectSection } from '@/sections/project-section';
import { ProfilePortrait } from '@/components/profile-portrait';
import { ProjectFeature } from '@/components/project-feature';
import { FooterGlobe } from '@/components/footer-globe';
import { ArrowUpRight, ArrowDown, ArrowUp, CodeXml, ContactRound, Download } from 'lucide-react';
import { read, mediaUrl } from '@/lib/data';
import { ThemeToggle } from '@/components/theme-toggle';
import { Reveal } from '@/components/reveal';
import { configured } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const settings = (await read('site_settings'))[0]?.data;
  return {
    title: settings?.title ?? 'Rohit Kumar Yadav',
    description: settings?.meta_description,
    openGraph: {
      title: settings?.title ?? 'Rohit Kumar Yadav',
      description: settings?.meta_description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: settings?.title ?? 'Rohit Kumar Yadav',
      description: settings?.meta_description,
    },
  };
}
export default async function Home() {
  const [profiles, projects, experiences, skills, education, interests, settings] =
    await Promise.all([
      read('profile'),
      read('projects'),
      read('experiences'),
      read('skills'),
      read('education'),
      read('interests'),
      read('site_settings'),
    ]);
  const p = profiles[0]?.data,
    s = settings[0]?.data;
  if (!p || !s)
    return (
      <main className="setup">
        <span className="eyebrow">ROHIT KUMAR YADAV / PORTFOLIO</span>
        <h1>
          A work in
          <br />
          <em>the making.</em>
        </h1>
        <p>
          {configured()
            ? 'Portfolio content is not published yet. Please check back soon.'
            : 'The portfolio is being prepared. Content will be available once the database is connected.'}
        </p>
      </main>
    );
  const social = (
    <>
      {p.github && (
        <a href={p.github} aria-label="GitHub">
          <CodeXml size={18} /> GitHub <ArrowUpRight size={14} />
        </a>
      )}
      {p.linkedin && (
        <a href={p.linkedin} aria-label="LinkedIn">
          <ContactRound size={18} /> LinkedIn <ArrowUpRight size={14} />
        </a>
      )}
      {p.x && (
        <a href={p.x} aria-label="X profile">
          𝕏 <span>X</span>
          <ArrowUpRight size={14} />
        </a>
      )}
    </>
  );
  const currentProject =
    projects.find((r) => r.data.currently_building) ??
    projects.find((r) => r.data.status === 'In Progress');
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <a className="wordmark" href="#top">
          RKY<span>↗</span>
        </a>
        <nav aria-label="Main navigation">
          {s.show_experiences && <a href="#experience">Experience</a>}
          {s.show_projects && <a href="#projects">Selected work</a>}
          {s.show_about && <a href="#about">About</a>}
          {p.resume_path && (
            <div className="resume-nav">
              <a href="/resume" target="_blank" rel="noopener noreferrer">
                My resume <ArrowUpRight size={15} />
              </a>
              <a href="/api/resume?download=1" aria-label="Download my resume PDF">
                <Download size={16} />
              </a>
            </div>
          )}
          <a href="#contact">
            Let’s talk <ArrowUpRight size={15} />
          </a>
        </nav>
        <ThemeToggle />
      </header>
      <main id="main">
        <section className="hero wrap" id="top">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="dot" /> {p.location}{' '}
              <span className="hero-index">PORTFOLIO / {new Date().getFullYear()}</span>
            </div>
            <p className="hello">Hello, I’m {p.name}.</p>
            <h1>
              Curiosity.
              <br />
              Code.
              <br />
              <em>Useful things.</em>
            </h1>
            <h2>{p.headline}</h2>
            <p className="intro">{p.introduction}</p>
            <div className="actions">
              {s.show_projects && (
                <a className="button primary" href="#projects">
                  View projects <ArrowUpRight size={18} />
                </a>
              )}
              <a className="button secondary" href={`mailto:${p.email}`}>
                Contact me <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="socials">{social}</div>
          </div>
          <div className="building-column">
            {currentProject ? (
              <ProjectFeature project={currentProject} githubProfile={p.github} compact />
            ) : (
              <div className="building-empty">
                <span className="eyebrow">CURRENT FOCUS</span>
                <p>{p.focus}</p>
                <a className="text-link" href={p.github}>
                  Follow on GitHub <ArrowUpRight size={16} />
                </a>
              </div>
            )}
          </div>
        </section>
        <div className="hero-bottom wrap">
          <span>AI & DATA / SOFTWARE / THE WEB</span>
          {(s.show_experiences || s.show_projects || s.show_about) && (
            <a
              className="scroll-next"
              href={s.show_experiences ? '#experience' : s.show_projects ? '#projects' : '#about'}
            >
              {s.show_experiences ? 'SCROLL TO EXPERIENCE' : 'SCROLL TO EXPLORE'}{' '}
              <ArrowDown size={16} />
            </a>
          )}
        </div>
        {s.show_experiences && <ExperienceSection experiences={experiences} />}
        {s.show_projects && (
          <ProjectSection
            projects={projects}
            featuredOnly={s.featured_only}
            githubProfile={p.github}
            currentProjectId={currentProject?.id}
          />
        )}
        {s.show_about && (
          <section className="about-band" id="about">
            <div className="wrap about">
              <span className="eyebrow">03 / A LITTLE CONTEXT</span>
              <Reveal>
                <h2>
                  I learn best when
                  <br />
                  I’m <em>building something.</em>
                </h2>
                <div className="about-copy">
                  {p.about
                    .split('\n')
                    .filter(Boolean)
                    .map((v, i) => (
                      <p key={i}>{v}</p>
                    ))}
                </div>
                <div className="about-note">
                  COMPUTER SCIENCE UNDERGRADUATE <span>GGSIPU · CLASS OF 2029</span>
                </div>
              </Reveal>
            </div>
          </section>
        )}
        {s.show_skills && (
          <section className="section wrap" id="skills">
            <div className="section-heading">
              <div>
                <span className="eyebrow">04 / THE TOOLKIT</span>
                <h2>
                  Tools I <em>build with.</em>
                </h2>
              </div>
              <p>
                A growing toolkit, grounded
                <br />
                in hands-on work.
              </p>
            </div>
            <div className="skills">
              {Array.from(new Set(skills.map((r) => r.data.category))).map((category) => (
                <div className="skill-group" key={category}>
                  <h3>{category}</h3>
                  <p>
                    {skills
                      .filter((r) => r.data.category === category)
                      .map((r) => r.data.name)
                      .join(' / ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        {s.show_education && (
          <section className="section wrap education" id="education">
            <span className="eyebrow">05 / FOUNDATIONS</span>
            {education.map((r) => (
              <div key={r.id}>
                <div className="education-heading">
                  <div>
                    <h2>{r.data.university}</h2>
                    <p>{r.data.degree}</p>
                  </div>
                  <span>
                    CLASS OF {r.data.graduation_year}
                    <br />
                    <strong>CGPA {r.data.cgpa}</strong>
                  </span>
                </div>
                <p className="eyebrow">RELEVANT COURSEWORK</p>
                <p className="coursework">{r.data.coursework.join(' · ')}</p>
              </div>
            ))}
          </section>
        )}
        {s.show_interests && interests.length > 0 && (
          <section className="section wrap" id="interests">
            <span className="eyebrow">BEYOND THE SCREEN</span>
            <h2>
              A few other <em>interests.</em>
            </h2>
            {interests.map((r) => (
              <div className="interest" key={r.id}>
                <h3>{r.data.title}</h3>
                <p>{r.data.description}</p>
              </div>
            ))}
          </section>
        )}
      </main>
      <footer id="contact">
        <div className="wrap">
          <div className="footer-top">
            <span className="eyebrow">HAVE SOMETHING IN MIND?</span>
            <span>
              <span className="dot" /> OPEN TO CONVERSATIONS
            </span>
          </div>
          <div className="footer-intro">
            <div>
              <h2>
                Let’s make
                <br />
                <em>something useful.</em> <ArrowUpRight />
              </h2>
              <p>
                For opportunities, collaborations, or a good conversation about building things.
              </p>
              <a className="email" href={`mailto:${p.email}`}>
                {p.email}
                <ArrowUpRight size={26} />
              </a>
            </div>
            <FooterGlobe name={p.name} />
            <div className="footer-portrait">
              <ProfilePortrait key={p.image} src={mediaUrl(p.image)} name={p.name} />
              <p>
                {p.name}
                <span>{p.location} · Always building.</span>
              </p>
            </div>
          </div>
          <div className="footer-links">
            <div className="socials">{social}</div>
            <nav aria-label="Footer navigation">
              <a href="#top">Home</a>
              {s.show_projects && <a href="#projects">Projects</a>}
              {s.show_about && <a href="#about">About</a>}
            </nav>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {p.name}. {s.footer_text}
            </span>
            <span>{p.location}</span>
            <a href="#top">
              Back to top <ArrowUp size={15} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
