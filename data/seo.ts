import type { PageSeo } from "@/types/content";

// Per-page metadata for static routes. Project and blog pages derive theirs from their own data.
export const pageSeo: PageSeo[] = [
  {
    id: "home",
    path: "/",
    label: "Home",
    title: "Arun Negi — Full Stack Developer",
    description:
      "Full Stack Developer with 3 years of experience shipping 15+ production web apps with Next.js, React.js, Node.js, Express.js, MongoDB and WordPress.",
  },
  {
    id: "about",
    path: "/about",
    label: "About",
    title: "About Arun Negi",
    description: "Background, focus areas, education and certifications of Full Stack Developer Arun Negi.",
  },
  {
    id: "projects",
    path: "/projects",
    label: "Projects",
    title: "Projects",
    description: "Production web applications across yoga, e-commerce, news media, government, healthcare and audit domains.",
  },
  {
    id: "experience",
    path: "/experience",
    label: "Experience",
    title: "Experience",
    description: "Professional experience at Dream Byte Solutions, GIKS Innovating Technologies and Ensino Research and Development.",
  },
  {
    id: "skills",
    path: "/skills",
    label: "Skills",
    title: "Skills",
    description: "Frontend, backend, database, CMS and tooling skills: Next.js, React.js, Node.js, Express.js, MongoDB, WordPress and more.",
  },
  {
    id: "services",
    path: "/services",
    label: "Services",
    title: "Services",
    description: "Full stack, frontend, REST API, e-commerce, WordPress, performance & SEO, and redesign services.",
  },
  {
    id: "blog",
    path: "/blog",
    label: "Blog",
    title: "Blog",
    description: "Notes on Next.js, React, Node.js, REST APIs, website performance, SEO and practical full stack development.",
  },
  {
    id: "contact",
    path: "/contact",
    label: "Contact",
    title: "Contact",
    description: "Get in touch with Arun Negi about a project, role or collaboration.",
  },
];
