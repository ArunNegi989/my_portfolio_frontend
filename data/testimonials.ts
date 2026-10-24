import type { Testimonial } from "@/types/content";

// No real testimonials have been supplied yet. The entries below are DEMO DATA for the
// admin interface only (isDemo: true) and are filtered out of the public site.
export const testimonials: Testimonial[] = [
  {
    id: "demo-1",
    name: "Demo Client",
    role: "Demo Role",
    company: "Sample Company (demo)",
    quote: "This is placeholder text used to demonstrate the testimonials manager. Replace it with a real, approved quote.",
    isDemo: true,
    visible: false,
  },
  {
    id: "demo-2",
    name: "Demo Reviewer",
    role: "Demo Role",
    company: "Example Org (demo)",
    quote: "Second placeholder entry. Demo testimonials are never shown on the public portfolio.",
    isDemo: true,
    visible: false,
  },
];
