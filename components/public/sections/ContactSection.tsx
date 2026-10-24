import { ArrowUpRight, Phone } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import { SocialIcon } from "@/components/shared/BrandIcons";
import { telHref } from "@/lib/utils";
import type { Profile, SiteSettings, SocialLink } from "@/types/content";
import ContactForm from "../ContactForm";
import styles from "./ContactSection.module.css";

interface ContactSectionProps {
  profile: Profile;
  settings: SiteSettings;
  socialLinks: SocialLink[];
  headline: string;
  text: string;
  projectTypes: string[];
  as?: "h1" | "h2";
}

export default function ContactSection({ profile, settings, socialLinks, headline, text, projectTypes, as = "h2" }: ContactSectionProps) {
  const Heading = as;
  const links = socialLinks.filter((l) => l.platform !== "email");
  const whatsapp = settings.whatsappNumber.replace(/\D/g, "");
  return (
    <section className={styles.section} aria-labelledby="contact-title">
      <div className={styles.glow} aria-hidden="true" />
      <div className={`container ${styles.layout}`}>
        <Reveal className={styles.intro}>
          <p className={styles.eyebrow}>Contact</p>
          <Heading id="contact-title" className={styles.title}>
            {headline}
          </Heading>
          <p className={styles.text}>{text}</p>
          <a href={`mailto:${profile.email}`} className={styles.email}>
            {profile.email} <ArrowUpRight size={22} aria-hidden="true" />
          </a>
          <ul role="list" className={styles.links}>
            {profile.phone && (
              <li>
                <a href={telHref(profile.phone)} className={styles.social}>
                  <Phone size={18} aria-hidden="true" /> {profile.phone}
                </a>
              </li>
            )}
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.social}>
                  <SocialIcon platform={link.platform} size={18} /> {link.label}
                </a>
              </li>
            ))}
            {whatsapp && (
              <li>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.social}>
                  <SocialIcon platform="whatsapp" size={18} /> WhatsApp
                </a>
              </li>
            )}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm email={profile.email} projectTypes={projectTypes} />
        </Reveal>
      </div>
    </section>
  );
}
