import PageHero from "@/components/public/PageHero";
import ContactCta from "@/components/public/sections/ContactCta";
import Marquee from "@/components/public/sections/Marquee";
import SkillsShowcase from "@/components/public/sections/SkillsShowcase";
import { getSettings, getSkills } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import styles from "../inner.module.css";

export function generateMetadata() {
  return pageMetadata("/skills");
}

export default async function SkillsPage() {
  const [{ categories, skills }, settings] = await Promise.all([getSkills(), getSettings()]);
  return (
    <>
      <PageHero
        eyebrow="Skills"
        title="The Toolkit"
        description="Technologies I use to design, build and ship production web applications, grouped the way they show up in real projects. No made-up percentage bars."
        image={settings.pageImages.skillsHero}
      />
      <Marquee items={skills.filter((s) => s.category !== "tools").slice(0, 14).map((s) => s.name)} />
      <section className={styles.section} aria-label="Skills by category">
        <div className="container">
          <SkillsShowcase categories={categories} skills={skills} headingLevel="h2" />
        </div>
      </section>
      <ContactCta />
    </>
  );
}
