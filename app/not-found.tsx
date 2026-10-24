import type { Metadata } from "next";
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import NotFoundContent from "@/components/public/NotFoundContent";
import { footerNavigation, navigation, settings, socialLinks } from "@/data/settings";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// Global 404 for unmatched URLs. It renders outside the (public) layout, so it adds the site chrome itself.
export default function NotFound() {
  return (
    <>
      <Navbar items={navigation} phone={profile.phone} email={profile.email} />
      <main id="main">
        <NotFoundContent />
      </main>
      <Footer profile={profile} settings={settings} navigation={footerNavigation} socialLinks={socialLinks.filter((l) => l.visible)} />
    </>
  );
}
