import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/animations/Reveal";
import { SocialIcon } from "@/components/shared/BrandIcons";
import { telHref } from "@/lib/utils";
import type { NavItem, Profile, SiteSettings, SocialLink } from "@/types/content";
import BackToTop from "./BackToTop";
import CurrentYear from "./CurrentYear";
import FooterHeadline from "./FooterHeadline";
import styles from "./Footer.module.css";

interface FooterProps {
  profile: Profile;
  settings: SiteSettings;
  navigation: NavItem[];
  socialLinks: SocialLink[];
}

export default function Footer({ profile, settings, navigation, socialLinks }: FooterProps) {
  const social = socialLinks.filter((link) => link.platform !== "email");
  return (
    <footer className={styles.footer} aria-labelledby="footer-title">
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.glow} />
        <div className={styles.horizon} />
      </div>

      <div className={`container ${styles.hero}`}>
        <p className={styles.eyebrow}>
          <span className={styles.pulse} aria-hidden="true" />
          {profile.availability}
        </p>
        <FooterHeadline id="footer-title" text={settings.footerHeadline} className={styles.headline} />
        <Reveal className={styles.heroRow} delay={0.15}>
          <p className={styles.invitation}>{settings.footerInvitation}</p>
          <Link href="/contact" className={styles.cta}>
            <span className={styles.ctaLabel}>{settings.footerCtaLabel}</span>
            <span className={styles.ctaIcon} aria-hidden="true">
              <ArrowUpRight size={22} />
            </span>
          </Link>
        </Reveal>
      </div>

      <div className="container">
        <Reveal as="div" className={styles.contactRow} delay={0.05}>
          {profile.phone && (
            <a href={telHref(profile.phone)} className={styles.contactCard}>
              <span className={styles.contactIcon} aria-hidden="true">
                <Phone size={18} />
              </span>
              <span className={styles.contactText}>
                <span className={styles.contactLabel}>Call</span>
                <span className={styles.contactValue}>{profile.phone}</span>
              </span>
              <ArrowUpRight size={18} className={styles.contactArrow} aria-hidden="true" />
            </a>
          )}
          <a href={`mailto:${profile.email}`} className={styles.contactCard}>
            <span className={styles.contactIcon} aria-hidden="true">
              <Mail size={18} />
            </span>
            <span className={styles.contactText}>
              <span className={styles.contactLabel}>Email</span>
              <span className={styles.contactValue}>{profile.email}</span>
            </span>
            <ArrowUpRight size={18} className={styles.contactArrow} aria-hidden="true" />
          </a>
          <div className={styles.contactCard}>
            <span className={styles.contactIcon} aria-hidden="true">
              <MapPin size={18} />
            </span>
            <span className={styles.contactText}>
              <span className={styles.contactLabel}>Based in</span>
              <span className={styles.contactValue}>{profile.location}</span>
            </span>
          </div>
        </Reveal>

        <div className={styles.columns}>
          <Reveal className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label={`${profile.name} — home`}>
              AN<span aria-hidden="true">.</span>
            </Link>
            <p className={styles.name}>{profile.name}</p>
            <p className={styles.tagline}>{settings.tagline}</p>
            {settings.footerHighlights.length > 0 && (
              <ul role="list" className={styles.highlights} aria-label="Roles and core technologies">
                {settings.footerHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </Reveal>

          <Reveal as="div" className={styles.col} delay={0.08}>
            <nav aria-label="Footer">
              <p className={styles.heading}>Navigate</p>
              <ul role="list" className={styles.navList}>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.navLink}>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {social.length > 0 && (
            <Reveal as="div" className={styles.col} delay={0.16}>
              <p className={styles.heading}>Connect</p>
              <ul role="list" className={styles.socialList}>
                {social.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} className={styles.social} target="_blank" rel="noopener noreferrer">
                      <span className={styles.socialIcon} aria-hidden="true">
                        <SocialIcon platform={link.platform} size={18} />
                      </span>
                      <span className={styles.socialLabel}>{link.label}</span>
                      <ArrowUpRight size={16} className={styles.socialArrow} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p>
            © <CurrentYear /> {profile.name}. {settings.footerNote}
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
