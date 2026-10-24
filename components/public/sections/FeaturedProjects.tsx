import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import ButtonLink from "@/components/shared/ButtonLink";
import type { HomeSection, Project } from "@/types/content";
import ProjectCard from "../ProjectCard";
import SectionHeading from "../SectionHeading";
import styles from "./FeaturedProjects.module.css";

export default function FeaturedProjects({ projects, section }: { projects: Project[]; section: HomeSection }) {
  const [lead, ...rest] = projects;
  return (
    <section className={styles.section} aria-labelledby="featured-title">
      <div className="container">
        <SectionHeading
          id="featured-title"
          eyebrow={section.eyebrow}
          title={section.title}
          description="Selected platforms from client work and freelance projects. Images are representative until project screenshots are added."
          action={
            <ButtonLink href="/projects" variant="outline" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
              View All Projects
            </ButtonLink>
          }
        />
        {lead && (
          <Reveal className={styles.lead}>
            <ProjectCard project={lead} variant="large" index={0} />
          </Reveal>
        )}
        <div className={styles.grid}>
          {rest.map((project, i) => (
            <Reveal key={project.id} delay={(i % 2) * 0.1} className={i % 2 ? styles.offset : undefined}>
              <ProjectCard project={project} index={i + 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
