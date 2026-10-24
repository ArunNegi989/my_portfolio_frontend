import { ArrowLeft, ArrowRight, ArrowUpRight, Info, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Reveal from "@/components/animations/Reveal";
import Gallery from "@/components/public/Gallery";
import LiveSiteButton from "@/components/public/LiveSiteButton";
import ProjectCard from "@/components/public/ProjectCard";
import { GithubIcon } from "@/components/shared/BrandIcons";
import ButtonLink from "@/components/shared/ButtonLink";
import SmartImage from "@/components/shared/SmartImage";
import TagList from "@/components/shared/TagList";
import { projects as allProjectData } from "@/data/projects";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { cx } from "@/lib/utils";
import styles from "./project.module.css";

export async function generateStaticParams() {
  return allProjectData.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return buildMetadata({
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    path: `/projects/${project.slug}`,
    image: project.cover.src,
  });
}

// The route's App Shell is shared by every link to /projects/[slug], so it must not read the slug.
// Everything that depends on it resolves inside the Suspense boundary.
export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectDetails params={params} />
    </Suspense>
  );
}

function ProjectSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading project…</span>
      <header className={styles.hero}>
        <div className={styles.grid} aria-hidden="true" />
        <div className="container">
          <Link href="/projects" className={styles.back}>
            <ArrowLeft size={16} aria-hidden="true" /> All projects
          </Link>
          <div aria-hidden="true">
            <span className={cx(styles.skeleton, styles.skeletonMeta)} />
            <span className={cx(styles.skeleton, styles.skeletonTitle)} />
            <span className={cx(styles.skeleton, styles.skeletonText)} />
          </div>
        </div>
      </header>
      <div className="container" aria-hidden="true">
        <div className={cx(styles.coverImage, styles.skeleton)} />
      </div>
    </div>
  );
}

async function ProjectDetails({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProjectBySlug(slug), getProjects()]);
  if (!project) notFound();

  const position = all.findIndex((p) => p.slug === project.slug);
  const prev = all[(position - 1 + all.length) % all.length];
  const next = all[(position + 1) % all.length];
  const related = all
    .filter((p) => p.slug !== project.slug && (p.category === project.category || p.experienceId === project.experienceId))
    .slice(0, 3);

  return (
    <article>
      <header className={styles.hero}>
        <div className={styles.grid} aria-hidden="true" />
        <div className="container">
          <Link href="/projects" className={styles.back}>
            <ArrowLeft size={16} aria-hidden="true" /> All projects
          </Link>
          <p className={styles.meta}>
            <span>{project.category}</span>
            {project.period && <span>{project.period}</span>}
          </p>
          <h1 className={styles.title}>{project.title}</h1>
          {(project.liveUrl || project.githubUrl) && (
            <div className={styles.actions}>
              <LiveSiteButton href={project.liveUrl} showHost />
              {project.githubUrl && (
                <ButtonLink href={project.githubUrl} variant="outline" icon={<GithubIcon size={16} />} aria-label="View source on GitHub (opens in a new tab)">
                  View on GitHub
                </ButtonLink>
              )}
            </div>
          )}
          <div className={styles.heroGrid}>
            <p className={styles.overview}>{project.overview}</p>
            <dl className={styles.facts}>
              <div>
                <dt>Delivered at</dt>
                <dd>{project.context}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{project.technologies.join(", ")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <div className="container">
        <figure className={styles.cover}>
          <div className={styles.coverImage}>
            <SmartImage src={project.cover.src} alt={project.cover.alt} priority sizes="100vw" />
          </div>
          {project.representativeImagery && (
            <figcaption>Representative image — not a screenshot of the project. {project.cover.credit}</figcaption>
          )}
        </figure>

        {project.detailsPending && (
          <aside className={styles.notice}>
            <Info size={18} aria-hidden="true" />
            <p>
              This case study is based on resume highlights. Screenshots and deeper implementation notes will be added as they
              become available.
            </p>
          </aside>
        )}

        <section className={styles.block} aria-labelledby="problem-title">
          <Reveal className={styles.blockHead}>
            <span className={styles.num}>01</span>
            <h2 id="problem-title">The problem</h2>
          </Reveal>
          <Reveal className={styles.blockBody} delay={0.05}>
            <p className={styles.lead}>{project.problem}</p>
          </Reveal>
        </section>

        <section className={styles.block} aria-labelledby="goals-title">
          <Reveal className={styles.blockHead}>
            <span className={styles.num}>02</span>
            <h2 id="goals-title">Goals</h2>
          </Reveal>
          <Reveal className={styles.blockBody} delay={0.05}>
            <ul role="list" className={styles.goals}>
              {project.goals.map((goal) => (
                <li key={goal}>
                  <Target size={18} aria-hidden="true" /> {goal}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className={styles.block} aria-labelledby="solution-title">
          <Reveal className={styles.blockHead}>
            <span className={styles.num}>03</span>
            <h2 id="solution-title">Solution &amp; implementation</h2>
          </Reveal>
          <Reveal className={styles.blockBody} delay={0.05}>
            <p className={styles.lead}>{project.solution}</p>
            <h3 className={styles.subhead}>Key features</h3>
            <ul role="list" className={styles.features}>
              {project.features.map((feature, i) => (
                <li key={feature}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {feature}
                </li>
              ))}
            </ul>
            <h3 className={styles.subhead}>Technology stack</h3>
            <TagList items={project.technologies} variant="accent" label="Technology stack" />
          </Reveal>
        </section>

        <section className={styles.block} aria-labelledby="process-title">
          <Reveal className={styles.blockHead}>
            <span className={styles.num}>04</span>
            <h2 id="process-title">Development process</h2>
          </Reveal>
          <Reveal className={styles.blockBody} delay={0.05}>
            <ol role="list" className={styles.process}>
              {project.process.map((step, i) => (
                <li key={step.title}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {project.results.length > 0 && (
          <section className={styles.block} aria-labelledby="results-title">
            <Reveal className={styles.blockHead}>
              <span className={styles.num}>05</span>
              <h2 id="results-title">Results &amp; impact</h2>
            </Reveal>
            <Reveal className={styles.blockBody} delay={0.05}>
              <ul role="list" className={styles.results}>
                {project.results.map((result) => (
                  <li key={result}>
                    <Trophy size={22} aria-hidden="true" />
                    {result}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        )}

        {project.gallery.length > 0 && (
          <section className={styles.gallery} aria-labelledby="gallery-title">
            <h2 id="gallery-title" className={styles.galleryTitle}>
              Gallery
            </h2>
            {project.representativeImagery && <p className={styles.galleryNote}>Representative imagery, not project screenshots.</p>}
            <Gallery images={project.gallery} title={project.title} />
          </section>
        )}

        <Reveal as="section" className={styles.finale} aria-labelledby="finale-title">
          <div className={styles.finaleGlow} aria-hidden="true" />
          <p className={styles.finaleEyebrow}>{project.liveUrl ? "See it in action" : "Next step"}</p>
          <h2 id="finale-title" className={styles.finaleTitle}>
            {project.liveUrl ? <>Explore {project.title} live.</> : <>Want something like {project.title}?</>}
          </h2>
          <p className={styles.finaleText}>
            {project.liveUrl
              ? "The case study covers how it was built. The live website shows how it works for real users."
              : "I can walk you through how this was built and how a similar approach would fit your project."}
          </p>
          <div className={styles.finaleActions}>
            <LiveSiteButton href={project.liveUrl} />
            {project.githubUrl && (
              <ButtonLink href={project.githubUrl} variant="outline" icon={<GithubIcon size={16} />} aria-label="View source on GitHub (opens in a new tab)">
                View on GitHub
              </ButtonLink>
            )}
            <ButtonLink href="/contact" variant={project.liveUrl ? "ghost" : "primary"} icon={<ArrowUpRight size={16} aria-hidden="true" />}>
              Discuss a similar project
            </ButtonLink>
          </div>
        </Reveal>

        <nav className={styles.pager} aria-label="More projects">
          <Link href={`/projects/${prev.slug}`} className={styles.pagerLink}>
            <span className={styles.pagerLabel}>
              <ArrowLeft size={14} aria-hidden="true" /> Previous
            </span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </Link>
          <Link href={`/projects/${next.slug}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerLabel}>
              Next <ArrowRight size={14} aria-hidden="true" />
            </span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        </nav>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title" className={styles.galleryTitle}>
              Related projects
            </h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </div>

    </article>
  );
}
