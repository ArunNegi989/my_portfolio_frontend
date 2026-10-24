import type { Experience } from "@/types/content";

// Roles, dates and achievements exactly as listed on the resume.
export const experience: Experience[] = [
  {
    id: "dream-byte-solutions",
    role: "Full Stack Developer",
    company: "Dream Byte Solutions",
    location: "Dehradun",
    startDate: "2025-10",
    endDate: null,
    summary:
      "Delivering client web applications end-to-end with Next.js, Node.js, Express.js and MongoDB, consistently meeting deadlines in Agile sprints.",
    responsibilities: [
      "Delivered 10+ client web applications end-to-end using Next.js, Node.js, Express.js and MongoDB, consistently meeting deadlines in Agile sprints.",
      "India Yoga Association, AYM Yoga School, Hatha Yog Ashram: built yoga platforms with program listings, teacher directories, online enrolment, student inquiry flows and blog publishing; reduced manual admin effort by ~60%.",
      "Yakka Pukka (SLA Audit Platform): engineered an audit management system to define SLA parameters, log findings, track compliance and generate reports.",
      "House of Intimacy: developed a mobile-first e-commerce platform with product catalog, category filtering and detailed product pages.",
      "Billing Software, Dream Inker, Looks Salon Academy, Chaukhamba Tour & Travels, Assignment Pathways, Dream Byte Studio: built invoicing (~50% faster invoice generation), appointment booking, course enrolment, travel booking, ed-tech and agency portfolio platforms with responsive UI.",
    ],
    relatedProjectSlugs: [
      "yoga-platforms",
      "yakka-pukka-sla-audit",
      "house-of-intimacy",
      "billing-software",
      "dream-inker",
      "looks-salon-academy",
      "chaukhamba-tour-travels",
      "assignment-pathways",
      "dream-byte-studio",
    ],
    technologies: ["Next.js", "Node.js", "Express.js", "MongoDB"],
    order: 1,
  },
  {
    id: "giks-innovating-technologies",
    role: "MERN Stack Developer",
    company: "GIKS Innovating Technologies",
    location: "Dehradun",
    startDate: "2024-03",
    endDate: "2025-10",
    summary:
      "Built MERN applications, a government portal on Liferay 7.4 DXP and WordPress news portals across government, HR, booking, healthcare and media domains.",
    responsibilities: [
      "National Hydrographic Office (Indian Navy): led frontend development of a government portal on Liferay 7.4 DXP and Bootstrap for nautical and hydrographic data visualization.",
      "HRMS: built a full HR system with employee onboarding, attendance and leave, payroll, role-based access control and real-time notifications.",
      "BookVenue: developed a real-time venue and court booking platform with dynamic pricing, slot availability and instant confirmation.",
      "DigiCase, Arogyadham, KingsInfra: delivered a case study management system, a healthcare platform with appointment booking and audio analysis, and a B2B seafood export catalog platform.",
      "Pioneer Edge, Mukhyadhara, HNN: developed WordPress news portals using Elementor, ACF, Yoast SEO, Rank Math and WP Rocket for fast-loading, SEO-optimized content.",
    ],
    relatedProjectSlugs: [
      "national-hydrographic-office",
      "hrms",
      "bookvenue",
      "digicase",
      "arogyadham",
      "kingsinfra",
      "wordpress-news-portals",
    ],
    technologies: ["MongoDB", "Express.js", "React.js", "Node.js", "Liferay 7.4 DXP", "Bootstrap", "WordPress"],
    order: 2,
  },
  {
    id: "ensino-research-development",
    role: "Frontend Development Intern",
    company: "Ensino Research and Development Pvt. Ltd.",
    location: "India",
    startDate: "2023-07",
    endDate: "2024-03",
    summary: "Built UI features for production apps using React.js, Angular and Bootstrap.",
    responsibilities: [
      "Built UI features for production apps using React.js, Angular and Bootstrap, including authentication flows for an Online Banking System and Online Voting System.",
    ],
    relatedProjectSlugs: ["banking-voting-auth-flows"],
    technologies: ["React.js", "Angular", "Bootstrap"],
    order: 3,
  },
];
