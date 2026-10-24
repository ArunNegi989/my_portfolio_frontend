import { Download } from "lucide-react";
import PageHero from "@/components/public/PageHero";
import ContactCta from "@/components/public/sections/ContactCta";
import ExperienceTimeline from "@/components/public/sections/ExperienceTimeline";
import ButtonLink from "@/components/shared/ButtonLink";
import { getExperience, getProfile, getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import styles from "../inner.module.css";

export const metadata = pageMetadata("/experience");

export default async function ExperiencePage() {
  const [experience, projects, profile] = await Promise.all([getExperience(), getProjects(), getProfile()]);
  return (
    <>
      <PageHero
        eyebrow="Experience"
        title="The Journey"
        description="Three years of shipping production web applications — from a frontend internship to leading full stack delivery for client platforms."
      >
        <div className={styles.heroActions}>
          <ButtonLink href={profile.resumePath} external download variant="outline" icon={<Download size={16} aria-hidden="true" />}>
            Download Resume
          </ButtonLink>
        </div>
      </PageHero>
      <section className={styles.section} aria-label="Work history">
        <div className="container">
          <ExperienceTimeline items={experience} projects={projects} headingLevel="h2" />
        </div>
      </section>
      <ContactCta />
    </>
  );
}
