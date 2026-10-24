import SmoothScroll from "@/components/animations/SmoothScroll";
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import { getNavigation, getProfile, getSettings, getSocialLinks } from "@/lib/data";
import { footerNavigation } from "@/data/settings";
import styles from "./public.module.css";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [navigation, profile, settings, socialLinks] = await Promise.all([
    getNavigation(),
    getProfile(),
    getSettings(),
    getSocialLinks(),
  ]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <Navbar items={navigation} phone={profile.phone} email={profile.email} />
      <main id="main" className={styles.main}>
        {children}
      </main>
      <Footer profile={profile} settings={settings} navigation={footerNavigation} socialLinks={socialLinks} />
      <div className={styles.grain} aria-hidden="true" />
      <SmoothScroll enabled={settings.smoothScroll} />
    </div>
  );
}
