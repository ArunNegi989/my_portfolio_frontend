import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import ButtonLink from "@/components/shared/ButtonLink";
import HeroVisual from "@/components/three/HeroVisual";
import type { HomeContent, Profile } from "@/types/content";
import ReplayIntroButton from "./ReplayIntroButton";
import RotatingRoles from "./RotatingRoles";
import styles from "./Hero.module.css";

interface HeroProps {
  home: HomeContent;
  profile: Profile;
  introEnabled: boolean;
}

export default function Hero({ home, profile, introEnabled }: HeroProps) {
  const [first, ...rest] = home.heroName.split(" ");
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.visual}>
        <HeroVisual labels={home.techLabels} />
      </div>

      <div className={`container ${styles.content}`} data-hero-reveal="">
        <div className={styles.topRow} style={{ "--d": 0 } as React.CSSProperties}>
          <span className={styles.status}>
            <span className={profile.availableForWork ? styles.dotOn : styles.dotOff} aria-hidden="true" />
            {profile.availability}
          </span>
          {introEnabled && <ReplayIntroButton />}
        </div>

        <p className={styles.role} style={{ "--d": 1 } as React.CSSProperties}>
          {home.heroRole}
        </p>
        <h1 id="hero-title" className={styles.name} style={{ "--d": 2 } as React.CSSProperties}>
          <span>{first}</span>
          <span className={styles.outline}>{rest.join(" ")}</span>
          <span className="sr-only">, {profile.role}</span>
        </h1>
        <div className={styles.headline} style={{ "--d": 3 } as React.CSSProperties}>
          <RotatingRoles roles={home.heroRoles} interval={home.heroRoleInterval} />
        </div>
        <p className={styles.support} style={{ "--d": 4 } as React.CSSProperties}>
          {home.heroSupportingText}
        </p>
        <div className={styles.ctas} style={{ "--d": 5 } as React.CSSProperties}>
          <ButtonLink href="/projects" icon={<ArrowUpRight size={18} aria-hidden="true" />}>
            {home.primaryCtaLabel}
          </ButtonLink>
          <ButtonLink href={profile.resumePath} variant="outline" external download icon={<Download size={16} aria-hidden="true" />}>
            {home.secondaryCtaLabel}
          </ButtonLink>
        </div>
      </div>

      <a href="#about-preview" className={styles.scroll}>
        <span className={styles.scrollTrack} aria-hidden="true">
          <span className={styles.scrollThumb} />
        </span>
        <span>Scroll</span>
        <ArrowDown size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
