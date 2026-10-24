import type { NavItem, SiteSettings, SocialLink } from "@/types/content";
import { unsplash, UNSPLASH_CREDIT } from "./images";

// The production domain is not decided yet. Set NEXT_PUBLIC_SITE_URL once it is.
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const settings: SiteSettings = {
  siteName: "Arun Negi — Full Stack Developer",
  siteUrl,
  tagline: "Full Stack Developer building scalable, responsive web experiences.",
  defaultOgImage: unsplash("1555066931-4365d14bab8c", 1200, 630),
  introEnabled: true,
  introAudioEnabled: false,
  smoothScroll: true,
  // Left empty on purpose: add a WhatsApp number (digits only, with country code) to show the CTA.
  whatsappNumber: "",
  footerNote: "Designed & developed by Arun Negi.",
  footerHeadline: "LET'S BUILD SOMETHING GREAT.",
  footerInvitation:
    "Have a product, website or platform in mind? I'm open to full-time roles and freelance collaborations. Let's talk about what you're building.",
  footerCtaLabel: "Start a Project",
  footerHighlights: ["Full Stack Developer", "WordPress Developer", "Next.js", "React.js", "Node.js", "MongoDB"],
  pageImages: {
    skillsHero: {
      src: unsplash("1627398242454-45a1465c2479", 1200),
      alt: "JavaScript code on a dark editor",
      credit: UNSPLASH_CREDIT,
    },
    educationSide: {
      src: unsplash("1503676260728-1c00da094a0b", 1000),
      alt: "Stack of books with an apple on a desk",
      credit: UNSPLASH_CREDIT,
    },
    projectsHero: {
      src: unsplash("1504639725590-34d0984388bd", 1200),
      alt: "Monitors showing code with glasses resting in front",
      credit: UNSPLASH_CREDIT,
    },
    blogHero: {
      src: unsplash("1486312338219-ce68d2c6f44d", 1200),
      alt: "Hands typing on a laptop",
      credit: UNSPLASH_CREDIT,
    },
  },
};

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Skills", href: "/skills" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const footerNavigation: NavItem[] = [...navigation, { label: "Services", href: "/services" }];

export const socialLinks: SocialLink[] = [
  { id: "github", platform: "github", label: "GitHub", url: "https://github.com/ArunNegi989", visible: true },
  {
    id: "linkedin",
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/arun-negi-738505207/",
    visible: true,
  },
  { id: "email", platform: "email", label: "Email", url: "mailto:arunnegi989@gmail.com", visible: true },
];
