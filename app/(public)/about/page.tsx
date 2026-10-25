import { ArrowUpRight, Award, Download, GraduationCap } from "lucide-react";
import CountUp from "@/components/animations/CountUp";
import Reveal from "@/components/animations/Reveal";
import PageHero from "@/components/public/PageHero";
import SectionHeading from "@/components/public/SectionHeading";
import ButtonLink from "@/components/shared/ButtonLink";
import SmartImage from "@/components/shared/SmartImage";
import TagList from "@/components/shared/TagList";
import { getEducation, getExperience, getProfile, getSettings, getSkills } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import styles from "../inner.module.css";

export function generateMetadata() {
  return pageMetadata("/about");
}

export default async function AboutPage() {
  const [profile, { education, certifications }, experience, { skills }, settings] = await Promise.all([
    getProfile(),
    getEducation(),
    getExperience(),
    getSkills(),
    getSettings(),
  ]);
  const core = ["Next.js", "React.js", "Node.js", "Express.js", "MongoDB", "WordPress"];
  const coreSkills = skills.filter((s) => core.includes(s.name)).map((s) => s.name);

  return (
    <>
      <PageHero eyebrow="About" title="Hi, I'm Arun." description={profile.summary} image={profile.aboutImage}>
        <div className={styles.heroActions}>
          <ButtonLink href={profile.resumePath} external download icon={<Download size={16} aria-hidden="true" />}>
            Download Resume
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
            Get in touch
          </ButtonLink>
        </div>
      </PageHero>

      <section className={styles.section} aria-labelledby="story-title">
        <div className={`container ${styles.split}`}>
          <Reveal>
            <p className={styles.eyebrow}>The short story</p>
            <h2 id="story-title" className={styles.h2}>
              Full stack, end to end.
            </h2>
          </Reveal>
          <div className={styles.prose}>
            {profile.aboutParagraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
            <Reveal>
              <TagList items={coreSkills} variant="accent" label="Core stack" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-label="Key numbers">
        <div className="container">
          <dl className={styles.statsBand}>
            {profile.stats.map((stat) => (
              <div key={stat.id}>
                <dt>{stat.label}</dt>
                <dd>
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </dd>
              </div>
            ))}
            <div>
              <dt>Companies</dt>
              <dd>{experience.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="focus-title">
        <div className="container">
          <SectionHeading id="focus-title" eyebrow="Focus" title="What I focus on" />
          <ul role="list" className={styles.cardGrid}>
            {profile.focusAreas.map((area, i) => (
              <Reveal as="li" key={area} delay={i * 0.06} className={styles.card}>
                <span className={styles.cardIndex}>{String(i + 1).padStart(2, "0")}</span>
                <p className={styles.cardTitle}>{area}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="education-title">
        <div className={`container ${styles.split}`}>
          <Reveal>
            <p className={styles.eyebrow}>Education & certifications</p>
            <h2 id="education-title" className={styles.h2}>
              Learning
            </h2>
            <div className={styles.sideImage}>
              <SmartImage
                src={settings.pageImages.educationSide.src}
                alt={settings.pageImages.educationSide.alt}
                sizes="(max-width: 900px) 100vw, 35vw"
              />
            </div>
          </Reveal>
          <div className={styles.stack}>
            {education.map((item) => (
              <Reveal key={item.id} className={styles.eduItem}>
                <GraduationCap size={22} aria-hidden="true" className={styles.eduIcon} />
                <div>
                  <h3 className={styles.h3}>{item.degree}</h3>
                  <p>
                    {item.institution}, {item.location}
                  </p>
                  <p className={styles.mono}>
                    {item.startYear} – {item.endYear}
                  </p>
                </div>
              </Reveal>
            ))}
            {certifications.map((cert) => (
              <Reveal key={cert.id} className={styles.eduItem}>
                <Award size={22} aria-hidden="true" className={styles.eduIcon} />
                <div>
                  <h3 className={styles.h3}>{cert.title}</h3>
                  {cert.issuer && <p>{cert.issuer}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
