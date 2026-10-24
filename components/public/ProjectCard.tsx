import { ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { GithubIcon } from "@/components/shared/BrandIcons";
import SmartImage from "@/components/shared/SmartImage";
import TagList from "@/components/shared/TagList";
import { cx } from "@/lib/utils";
import type { Project } from "@/types/content";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
  variant?: "large" | "default" | "compact";
  index?: number;
  headingLevel?: "h2" | "h3";
}

export default function ProjectCard({ project, variant = "default", index, headingLevel = "h3" }: ProjectCardProps) {
  const Heading = headingLevel;
  const href = `/projects/${project.slug}`;
  return (
    <article className={cx(styles.card, styles[variant])}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
        <SmartImage
          src={project.cover.src}
          alt=""
          sizes={variant === "large" ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 40vw"}
          className={styles.image}
        />
        {project.representativeImagery && <span className={styles.badge}>Representative image</span>}
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          {typeof index === "number" && <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>}
          <span className={styles.category}>{project.category}</span>
        </div>
        <Heading className={styles.title}>
          <Link href={href}>{project.title}</Link>
        </Heading>
        <p className={styles.summary}>{project.summary}</p>
        <TagList items={project.technologies.slice(0, variant === "compact" ? 3 : 5)} label="Technologies" />
        <div className={styles.links}>
          <Link href={href} className={styles.primaryLink}>
            View Case Study <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconLink}
              aria-label={`Visit the live ${project.title} website (opens in a new tab)`}
            >
              <ExternalLink size={15} aria-hidden="true" /> Live website
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
              <GithubIcon size={15} /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
