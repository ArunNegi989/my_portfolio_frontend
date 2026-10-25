import PageHero from "@/components/public/PageHero";
import ProjectsExplorer from "@/components/public/ProjectsExplorer";
import ContactCta from "@/components/public/sections/ContactCta";
import { getProjects, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import styles from "../inner.module.css";

export function generateMetadata() {
  return pageMetadata("/projects");
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const categories = Array.from(new Set(projects.map((p) => p.category)));
  return (
    <>
      <PageHero
        eyebrow={`Projects — ${projects.length}`}
        title="Selected Work"
        description="Production platforms across yoga, e-commerce, news media, government, healthcare and audit domains. Search by name or technology."
        image={settings.pageImages.projectsHero}
      />
      <section className={styles.section} aria-label="Project list">
        <div className="container">
          <ProjectsExplorer projects={projects} categories={categories} />
        </div>
      </section>
      <ContactCta />
    </>
  );
}
