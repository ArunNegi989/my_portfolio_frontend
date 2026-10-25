import ContactSection from "@/components/public/sections/ContactSection";
import { getHomeContent, getProfile, getServices, getSettings, getSocialLinks } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import styles from "./contact.module.css";

export function generateMetadata() {
  return pageMetadata("/contact");
}

export default async function ContactPage() {
  const [profile, settings, socialLinks, home, services] = await Promise.all([
    getProfile(),
    getSettings(),
    getSocialLinks(),
    getHomeContent(),
    getServices(),
  ]);
  return (
    <div className={styles.page}>
      <ContactSection
        as="h1"
        profile={profile}
        settings={settings}
        socialLinks={socialLinks}
        headline={home.contactHeadline}
        text={`${home.contactText} ${profile.availability}.`}
        projectTypes={services.map((s) => s.title)}
      />
    </div>
  );
}
