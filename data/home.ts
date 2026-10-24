import type { HomeContent } from "@/types/content";

export const home: HomeContent = {
  heroName: "ARUN NEGI",
  heroRole: "HELLO, I'M",
  heroRoles: ["Full Stack Developer", "WordPress Developer", "Frontend Developer", "Backend Developer", "Next.js Developer"],
  heroRoleInterval: 3.5,
  heroSupportingText:
    "I build scalable, responsive, and interactive digital experiences using modern frontend and backend technologies.",
  primaryCtaLabel: "Explore My Work",
  secondaryCtaLabel: "Download Resume",
  techLabels: ["Next.js", "React.js", "Node.js", "Express.js", "MongoDB", "TypeScript", "WordPress", "REST APIs"],
  featuredProjectSlugs: ["yoga-platforms", "yakka-pukka-sla-audit", "national-hydrographic-office", "petcard", "bookvenue"],
  sections: [
    { key: "about", label: "About preview", visible: true, eyebrow: "01 / About", title: "End-to-end, from pixel to database." },
    { key: "projects", label: "Featured projects", visible: true, eyebrow: "02 / Selected Work", title: "Featured Projects" },
    { key: "skills", label: "Skills", visible: true, eyebrow: "03 / Stack", title: "The Toolkit" },
    { key: "experience", label: "Experience timeline", visible: true, eyebrow: "04 / Journey", title: "Experience" },
    { key: "services", label: "Services", visible: true, eyebrow: "05 / Services", title: "What I Can Build For You" },
    { key: "blog", label: "Latest blog posts", visible: true, eyebrow: "06 / Writing", title: "Latest From The Blog" },
    { key: "contact", label: "Contact CTA", visible: true, eyebrow: "07 / Contact", title: "Have an idea? Let's build it." },
  ],
  contactHeadline: "HAVE AN IDEA? LET'S BUILD IT.",
  contactText:
    "Tell me about the product, website or platform you have in mind. I'll get back to you with questions, an approach and a realistic timeline.",
};
