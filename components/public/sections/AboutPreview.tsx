import { ArrowUpRight } from "lucide-react";
import CountUp from "@/components/animations/CountUp";
import Reveal from "@/components/animations/Reveal";
import ButtonLink from "@/components/shared/ButtonLink";
import SmartImage from "@/components/shared/SmartImage";
import type { HomeSection, Profile } from "@/types/content";
import styles from "./AboutPreview.module.css";

export default function AboutPreview({ profile, section }: { profile: Profile; section: HomeSection }) {
  return (
    <section id="about-preview" className={styles.section} aria-labelledby="about-preview-title">
      <div className={`container ${styles.layout}`}>
        <Reveal className={styles.media}>
          <SmartImage src={profile.portraitImage.src} alt={profile.portraitImage.alt} sizes="(max-width: 900px) 100vw, 40vw" />
          <div className={styles.mediaCard}>
            <span className={styles.mediaLabel}>Based in</span>
            <span className={styles.mediaValue}>{profile.location}</span>
          </div>
        </Reveal>

        <div className={styles.text}>
          <Reveal>
            <p className={styles.eyebrow}>{section.eyebrow}</p>
            <h2 id="about-preview-title" className={styles.title}>
              {section.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.summary}>{profile.summary}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul role="list" className={styles.focus}>
              {profile.focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <dl className={styles.stats}>
              {profile.stats.map((stat) => (
                <div key={stat.id} className={styles.stat}>
                  <dt className={styles.statLabel}>{stat.label}</dt>
                  <dd className={styles.statValue}>
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.25}>
            <ButtonLink href="/about" variant="outline" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
              More about me
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
