import { ArrowUpRight } from "lucide-react";
import Intro from "@/components/animations/Intro";
import Hero from "@/components/public/home/Hero";
import PostCard from "@/components/public/PostCard";
import SectionHeading from "@/components/public/SectionHeading";
import AboutPreview from "@/components/public/sections/AboutPreview";
import ContactSection from "@/components/public/sections/ContactSection";
import ExperienceTimeline from "@/components/public/sections/ExperienceTimeline";
import FeaturedProjects from "@/components/public/sections/FeaturedProjects";
import Marquee from "@/components/public/sections/Marquee";
import ServicesList from "@/components/public/sections/ServicesList";
import SkillsShowcase from "@/components/public/sections/SkillsShowcase";
import Reveal from "@/components/animations/Reveal";
import ButtonLink from "@/components/shared/ButtonLink";
import {
  getExperience,
  getFeaturedProjects,
  getHomeContent,
  getPosts,
  getProfile,
  getProjects,
  getServices,
  getSettings,
  getSkills,
  getSocialLinks,
} from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { HomeSectionKey } from "@/types/content";
import styles from "./home.module.css";

export function generateMetadata() {
  return pageMetadata("/");
}

export default async function HomePage() {
  const [home, profile, settings, featured, projects, skills, experience, services, posts, socialLinks] = await Promise.all([
    getHomeContent(),
    getProfile(),
    getSettings(),
    getFeaturedProjects(),
    getProjects(),
    getSkills(),
    getExperience(),
    getServices(),
    getPosts(),
    getSocialLinks(),
  ]);

  const section = (key: HomeSectionKey) => home.sections.find((s) => s.key === key && s.visible);
  const about = section("about");
  const work = section("projects");
  const stack = section("skills");
  const journey = section("experience");
  const offer = section("services");
  const writing = section("blog");
  const contact = section("contact");

  return (
    <>
      {settings.introEnabled && <Intro />}
      <Hero home={home} profile={profile} introEnabled={settings.introEnabled} />
      <Marquee items={home.techLabels} />

      {about && <AboutPreview profile={profile} section={about} />}

      {work && featured.length > 0 && <FeaturedProjects projects={featured} section={work} />}

      {stack && (
        <section className={styles.section} aria-labelledby="skills-title">
          <div className="container">
            <SectionHeading
              id="skills-title"
              eyebrow={stack.eyebrow}
              title={stack.title}
              description="The technologies I use day to day, grouped the way they show up in real projects."
              action={
                <ButtonLink href="/skills" variant="ghost" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
                  All skills
                </ButtonLink>
              }
            />
            <SkillsShowcase categories={skills.categories} skills={skills.skills} />
          </div>
        </section>
      )}

      {journey && (
        <section className={styles.section} aria-labelledby="experience-title">
          <div className="container">
            <SectionHeading
              id="experience-title"
              eyebrow={journey.eyebrow}
              title={journey.title}
              description="Three years across a product agency, a MERN development company and a frontend internship."
              action={
                <ButtonLink href="/experience" variant="ghost" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
                  Full experience
                </ButtonLink>
              }
            />
            <ExperienceTimeline items={experience} projects={projects} compact />
          </div>
        </section>
      )}

      {offer && (
        <section className={styles.section} aria-labelledby="services-title">
          <div className="container">
            <SectionHeading
              id="services-title"
              eyebrow={offer.eyebrow}
              title={offer.title}
              action={
                <ButtonLink href="/services" variant="ghost" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
                  Service details
                </ButtonLink>
              }
            />
            <ServicesList services={services} />
          </div>
        </section>
      )}

      {writing && posts.length > 0 && (
        <section className={styles.section} aria-labelledby="blog-title">
          <div className="container">
            <SectionHeading
              id="blog-title"
              eyebrow={writing.eyebrow}
              title={writing.title}
              action={
                <ButtonLink href="/blog" variant="outline" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
                  All articles
                </ButtonLink>
              }
            />
            <div className={styles.posts}>
              {posts.slice(0, 3).map((post, i) => (
                <Reveal key={post.id} delay={i * 0.08}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {contact && (
        <ContactSection
          profile={profile}
          settings={settings}
          socialLinks={socialLinks}
          headline={home.contactHeadline}
          text={home.contactText}
          projectTypes={services.map((s) => s.title)}
        />
      )}
    </>
  );
}
