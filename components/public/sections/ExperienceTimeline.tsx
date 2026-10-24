import { MapPin } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/animations/Reveal";
import TagList from "@/components/shared/TagList";
import { formatRange } from "@/lib/utils";
import type { Experience, Project } from "@/types/content";
import styles from "./ExperienceTimeline.module.css";

interface ExperienceTimelineProps {
  items: Experience[];
  projects: Project[];
  compact?: boolean;
  headingLevel?: "h2" | "h3";
}

export default function ExperienceTimeline({ items, projects, compact = false, headingLevel = "h3" }: ExperienceTimelineProps) {
  const Heading = headingLevel;
  return (
    <ol role="list" className={styles.timeline}>
      {items.map((job, index) => {
        const related = job.relatedProjectSlugs
          .map((slug) => projects.find((p) => p.slug === slug))
          .filter((p): p is Project => Boolean(p));
        return (
          <Reveal as="li" key={job.id} className={styles.item} delay={index * 0.05}>
            <span className={styles.node} aria-hidden="true" />
            <div className={styles.when}>
              <p className={styles.dates}>{formatRange(job.startDate, job.endDate)}</p>
              {!job.endDate && <span className={styles.current}>Current</span>}
            </div>
            <div className={styles.body}>
              <Heading className={styles.role}>{job.role}</Heading>
              <p className={styles.company}>
                {job.company}
                <span className={styles.location}>
                  <MapPin size={14} aria-hidden="true" /> {job.location}
                </span>
              </p>
              <p className={styles.summary}>{job.summary}</p>
              {!compact && (
                <ul className={styles.responsibilities}>
                  {job.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <TagList items={job.technologies} variant="accent" label="Technologies used" />
              {related.length > 0 && (
                <div className={styles.projects}>
                  <p className={styles.projectsLabel}>Projects</p>
                  <ul role="list" className={styles.projectLinks}>
                    {related.map((project) => (
                      <li key={project.slug}>
                        <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
