import type { Certification, Education } from "@/types/content";

export const education: Education[] = [
  {
    id: "btech-shivalik",
    degree: "B.Tech",
    institution: "Shivalik College of Engineering",
    location: "Dehradun",
    startYear: "2020",
    endYear: "2024",
  },
  {
    id: "ba-kumaun",
    degree: "B.A.",
    institution: "Kumaun University",
    location: "Nainital",
    startYear: "2017",
    endYear: "2020",
  },
];

export const certifications: Certification[] = [
  { id: "nodejs-workshop", title: "Node.js Workshop", issuer: "Shivalik College" },
  { id: "cybersecurity-basics", title: "Cybersecurity Basics", issuer: "ICT Academy" },
  { id: "python-pandas", title: "Python for Data Analysis with Pandas", issuer: "" },
];
