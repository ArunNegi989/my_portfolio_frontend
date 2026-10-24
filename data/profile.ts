import type { Profile } from "@/types/content";
import { unsplash, UNSPLASH_CREDIT } from "./images";

// Source of truth: Arun Negi's resume (Oct 2026 version).
export const profile: Profile = {
  name: "Arun Negi",
  shortName: "AN.",
  role: "Full Stack Developer",
  headline: "Building Digital Experiences That Work Beyond Expectations.",
  intro:
    "I build scalable, responsive, and interactive digital experiences using modern frontend and backend technologies.",
  summary:
    "Full Stack Developer with 3 years of experience building and shipping 15+ production web applications across yoga, e-commerce, news media, government, healthcare and audit domains. Strong in Next.js, React.js, Node.js, Express.js, MongoDB and WordPress, with a focus on clean code, SEO-optimized responsive interfaces, REST API design, JWT authentication and on-time delivery in Agile teams.",
  aboutParagraphs: [
    "I work across the full stack: from the interface a visitor touches first, through the REST APIs behind it, to the database that keeps it all consistent. Most of my day is spent in Next.js, React.js, Node.js, Express.js and MongoDB, with WordPress and Liferay when a project calls for a CMS.",
    "Over three years I have shipped 15+ production web applications for yoga schools, e-commerce brands, news portals, a government organisation, healthcare providers and audit teams. At Dream Byte Solutions alone I have delivered 10+ client web applications end-to-end.",
    "I care about clean code, SEO-friendly and responsive interfaces, secure authentication with JWT, and delivering on time inside Agile sprints.",
  ],
  focusAreas: [
    "End-to-end web development",
    "Responsive, SEO-friendly interfaces",
    "REST API design & JWT authentication",
    "CMS-driven websites (WordPress, Liferay)",
  ],
  email: "arunnegi989@gmail.com",
  phone: "+91 84768 98395",
  location: "Dehradun, India",
  availability: "Open to full-time roles & freelance projects",
  availableForWork: true,
  resumePath: "/resume/Arun_Negi_Resume.pdf",
  stats: [
    { id: "years", value: 3, suffix: "", label: "Years of experience" },
    { id: "apps", value: 15, suffix: "+", label: "Production web applications" },
    { id: "clients", value: 10, suffix: "+", label: "Client apps delivered at Dream Byte Solutions" },
  ],
  portraitImage: {
    src: unsplash("1550439062-609e1531270e", 1400),
    alt: "Top-down view of a developer working at a dark desk with three monitors",
    credit: UNSPLASH_CREDIT,
  },
  aboutImage: {
    src: unsplash("1498050108023-c5249f4df085", 1400),
    alt: "Laptop showing source code on a bright, minimal desk",
    credit: UNSPLASH_CREDIT,
  },
};
