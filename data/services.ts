import type { Service } from "@/types/content";
import { unsplash, UNSPLASH_CREDIT } from "./images";

// Proposed service categories based on resume skills. Edit freely.
export const services: Service[] = [
  {
    id: "full-stack",
    slug: "full-stack-web-development",
    title: "Full Stack Web Development",
    shortTitle: "Full Stack",
    description:
      "End-to-end web applications: interface, REST API, database and deployment-ready code, built with Next.js, Node.js, Express.js and MongoDB.",
    deliverables: ["Next.js frontends", "Node.js / Express.js APIs", "MongoDB data models", "Admin dashboards"],
    technologies: ["Next.js", "React.js", "Node.js", "Express.js", "MongoDB"],
    image: {
      src: unsplash("1587620962725-abab7fe55159", 1200),
      alt: "Laptop displaying code beside a small plant",
      credit: UNSPLASH_CREDIT,
    },
    visible: true,
    order: 1,
  },
  {
    id: "frontend",
    slug: "frontend-development",
    title: "Frontend Development",
    shortTitle: "Frontend",
    description:
      "Responsive, accessible and SEO-friendly interfaces in Next.js and React.js, styled with CSS Modules, Tailwind CSS, SASS or Bootstrap.",
    deliverables: ["Component libraries", "Responsive layouts", "Interactive UI", "Design-to-code from Figma"],
    technologies: ["Next.js", "React.js", "TypeScript", "CSS Modules", "Tailwind CSS"],
    image: {
      src: unsplash("1559028012-481c04fa702d", 1200),
      alt: "Designer monitor showing a website interface",
      credit: UNSPLASH_CREDIT,
    },
    visible: true,
    order: 2,
  },
  {
    id: "backend-api",
    slug: "backend-and-rest-api-development",
    title: "Backend and REST API Development",
    shortTitle: "REST APIs",
    description:
      "RESTful APIs on Node.js and Express.js with JWT authentication, role-based access and clean data models in MongoDB or MySQL.",
    deliverables: ["REST API design", "JWT authentication", "Role-based access control", "MongoDB / MySQL schemas"],
    technologies: ["Node.js", "Express.js", "JWT", "MongoDB", "MySQL"],
    image: {
      src: unsplash("1558494949-ef010cbdcc31", 1200),
      alt: "Server rack with neatly organised network cables",
      credit: UNSPLASH_CREDIT,
    },
    visible: true,
    order: 3,
  },
  {
    id: "ecommerce",
    slug: "e-commerce-development",
    title: "E-commerce Development",
    shortTitle: "E-commerce",
    description:
      "Mobile-first stores with product catalogs, category filtering, cart, checkout and payments, in Next.js or WooCommerce.",
    deliverables: ["Product catalogs", "Cart & checkout", "Stripe payments", "Order tracking"],
    technologies: ["Next.js", "Stripe", "WooCommerce", "MongoDB"],
    image: {
      src: unsplash("1563013544-824ae1b704d3", 1200),
      alt: "Hands holding a credit card while shopping on a laptop",
      credit: UNSPLASH_CREDIT,
    },
    visible: true,
    order: 4,
  },
  {
    id: "wordpress",
    slug: "wordpress-development",
    title: "WordPress Development",
    shortTitle: "WordPress",
    description:
      "Content-managed WordPress sites built with Elementor and ACF, optimised with Yoast SEO, Rank Math and WP Rocket.",
    deliverables: ["Custom Elementor layouts", "ACF content models", "News & blog portals", "WooCommerce stores"],
    technologies: ["WordPress", "Elementor", "ACF", "WooCommerce", "WPForms"],
    image: {
      src: unsplash("1585829365295-ab7cd400c167", 1200),
      alt: "Vintage typewriter with a sheet of paper reading News",
      credit: UNSPLASH_CREDIT,
    },
    visible: true,
    order: 5,
  },
  {
    id: "performance-seo",
    slug: "website-performance-and-seo",
    title: "Website Performance and SEO",
    shortTitle: "Performance & SEO",
    description:
      "Faster pages and cleaner markup: image optimisation, caching, semantic HTML, metadata and on-page SEO for better discoverability.",
    deliverables: ["Core Web Vitals review", "Metadata & structured content", "Caching setup", "Image optimisation"],
    technologies: ["Next.js", "Yoast SEO", "Rank Math", "WP Rocket"],
    image: {
      src: unsplash("1504868584819-f8e8b4b6d7e3", 1200),
      alt: "Laptop showing analytics charts on a couch",
      credit: UNSPLASH_CREDIT,
    },
    visible: true,
    order: 6,
  },
  {
    id: "redesign-maintenance",
    slug: "website-redesign-and-maintenance",
    title: "Website Redesign and Maintenance",
    shortTitle: "Redesign & Care",
    description:
      "Modernising existing websites with responsive layouts and a cleaner UI, then keeping them updated, secure and fast.",
    deliverables: ["UI refresh", "Responsive rebuilds", "Content updates", "Ongoing maintenance"],
    technologies: ["Next.js", "React.js", "WordPress", "Figma"],
    image: {
      src: unsplash("1581291518857-4e27b48ff24e", 1200),
      alt: "Hand sketching website wireframes on paper",
      credit: UNSPLASH_CREDIT,
    },
    visible: true,
    order: 7,
  },
];
